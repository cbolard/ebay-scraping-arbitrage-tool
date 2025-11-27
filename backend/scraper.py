from curl_cffi import requests
from bs4 import BeautifulSoup
import csv
import os
import re
import sys
import locale
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse

# Config locale
try:
    locale.setlocale(locale.LC_TIME, 'fr_FR.UTF-8')
except Exception:
    pass


def is_listing_active(item_element, is_sold_search=False):
    """
    Vérifie si une annonce est disponible à l'achat.
    Basé UNIQUEMENT sur le HTML de la carte de résultat (.s-item ou .s-card).
    Ne fait AUCUNE requête HTTP supplémentaire.

    Args:
        item_element: BeautifulSoup element représentant un item de résultat
        is_sold_search: True si c'est une recherche de ventes terminées (LH_Sold=1)

    Returns:
        bool: True si l'annonce est valide, False sinon
    """
    item_text = item_element.get_text(separator=" ", strip=True).lower()

    # ================================================================
    # FILTRAGE COMMUN : Annonces promotionnelles "Shop on eBay"
    # ================================================================
    if "shop on ebay" in item_text or "boutique sur ebay" in item_text:
        return False

    # Pour les recherches de ventes terminées (LH_Sold=1), on accepte tout le reste
    # car le but EST de récupérer les ventes passées
    if is_sold_search:
        return True

    # ================================================================
    # FILTRAGE ANNONCES ACTIVES UNIQUEMENT (ci-dessous)
    # ================================================================

    # 1. CLASSE CSS INDICATEUR DE FIN : .s-item__ended-date
    ended_date_elem = item_element.select_one(".s-item__ended-date")
    if ended_date_elem:
        return False

    # 2. DÉTECTION DE TEXTE NÉGATIF DANS LES DÉTAILS
    # On vérifie dans les spans de détails, pas dans le titre
    detail_elems = item_element.select(".s-item__detail, .s-card__subtitle, .s-item__subtitle, [class*='detail']")
    for detail in detail_elems:
        detail_text = detail.get_text(strip=True).lower()
        negative_phrases = [
            # Français
            "vente terminée",
            "vendu",
            "plus disponible",
            "épuisé",
            "rupture",
            # Anglais
            "out of stock",
            "sold",
            "ended",
            "no longer available",
            "sold out",
        ]
        for phrase in negative_phrases:
            if phrase in detail_text:
                return False

    # 3. VÉRIFICATION DE LA QUANTITÉ (0 disponible)
    quantity_patterns = [
        r"0\s*disponible",
        r"0\s*available",
        r"quantité\s*:\s*0",
        r"quantity\s*:\s*0",
    ]
    for pattern in quantity_patterns:
        if re.search(pattern, item_text):
            return False

    # 4. PRIX INTROUVABLE = annonce invalide (vérifié plus tard dans la boucle principale)
    # On laisse passer ici, le filtrage par prix se fait après

    return True


def generer_nom_fichier(url):
    parsed_url = urlparse(url)
    # Gestion basique du domaine (ebay.fr -> ebay)
    try:
        nom_domaine = parsed_url.netloc.split('.')[-2]
    except IndexError:
        nom_domaine = "site"
        
    query_string = parse_qs(parsed_url.query)
    terme_recherche = query_string.get('_nkw', [''])[0].replace(' ', '-')
    if not terme_recherche:
        terme_recherche = query_string.get('k', ['default'])[0].replace(' ', '-')
    return f"{nom_domaine}_{terme_recherche}.csv"

def extract_price(item):
    # Sélecteurs multiples pour le prix
    price_elem = (
        item.select_one(".s-item__price") or 
        item.select_one(".s-item__price--new") or
        item.select_one(".POSITIVE") or 
        item.select_one(".STRIKETHROUGH") or
        item.select_one(".s-card__price")
    )
    
    if not price_elem: return 0.0

    # Nettoyage agressif
    clean_str = price_elem.text.strip().replace(' ', '').replace('\xa0', '').replace('EUR', '').replace('€', '')
    match = re.search(r"(\d+([.,]\d+)?)", clean_str)
    
    if match:
        valeur_string = match.group(1).replace(',', '.')
        try:
            return float(valeur_string)
        except ValueError:
            pass
    return 0.0

def extract_date(item):
    # Multiple selectors for date info
    date_elem = (
        item.select_one(".s-item__caption") or
        item.select_one(".s-item__detail--secondary") or
        item.select_one(".s-item__ended-date") or
        item.select_one("[class*='date']")
    )
    text_to_search = date_elem.text if date_elem else item.text

    # French format: "Vendu le 26 nov. 2025" or "Vendu le 26 novembre 2025"
    match = re.search(r"Vendu le\s+(\d{1,2}\s+[a-zA-Zéûùà]+\.?\s+\d{4})", text_to_search, re.IGNORECASE)
    if match:
        return match.group(1)

    # English format: "Sold Nov 26, 2025" or "Sold 26 Nov 2025"
    match = re.search(r"Sold\s+(\w+\s+\d{1,2},?\s+\d{4}|\d{1,2}\s+\w+\s+\d{4})", text_to_search, re.IGNORECASE)
    if match:
        return match.group(1)

    # Just a date: "26 nov. 2025" or "Nov 26, 2025"
    match = re.search(r"(\d{1,2}\s+[a-zA-Zéûùà]+\.?\s+\d{4})", text_to_search)
    if match:
        return match.group(1)

    return "N/A"

def extract_condition(item):
    # Multiple selectors for condition (supports both s-item and s-card)
    cond_elem = (
        item.select_one(".s-card__subtitle") or      # New eBay s-card format
        item.select_one(".SECONDARY_INFO") or        # Old format
        item.select_one(".s-item__subtitle") or      # Old s-item format
        item.select_one("[class*='condition']") or
        item.select_one(".s-item__detail--secondary")
    )
    if cond_elem:
        cond_text = cond_elem.text.strip()
        # Clean up condition text (remove seller info after |)
        if "|" in cond_text:
            cond_text = cond_text.split("|")[0].strip()
        if cond_text and len(cond_text) < 50:
            return cond_text

    # Fallback: keyword search in item text
    text = item.text.lower()
    if "neuf" in text or "brand new" in text:
        return "Neuf"
    if "occasion" in text or "pre-owned" in text:
        return "Occasion"
    if "reconditionné" in text or "refurbished" in text or "certified" in text:
        return "Reconditionné"
    if "pièces" in text or "parts" in text or "broken" in text:
        return "Pour pièces"

    return "N/A"

def scrape_ebay(url):
    print(f"Scraping: {url} (Mode: Stealth TLS)", flush=True)

    # Extraire le domaine de l'URL
    parsed = urlparse(url)
    domain = parsed.netloc  # ex: www.ebay.fr

    # Headers complets pour imiter parfaitement Chrome 120+
    # CRITIQUE pour qu'eBay renvoie le bon HTML
    headers = {
        'Authority': domain,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'max-age=0',
        'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',  # Changed to 'none' for first request
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': f'https://{domain}/',
    }

    try:
        response = requests.get(
            url,
            impersonate="chrome120",
            headers=headers,
            timeout=30
        )
        
        # Gestion explicite des erreurs
        if response.status_code == 503:
            print("❌ ERREUR 503: eBay bloque toujours l'IP. Proxy requis.")
            return []
        if response.status_code != 200:
            print(f"❌ Erreur HTTP {response.status_code}")
            return []
            
    except Exception as e:
        print(f"❌ Erreur réseau critique: {e}")
        return []

    soup = BeautifulSoup(response.text, 'html.parser')

    # Détecter si c'est une recherche de ventes terminées
    is_sold_search = "LH_Sold=1" in url or "LH_Complete=1" in url

    # eBay uses either .s-card (new) or .s-item (old) - try both
    items = soup.select(".s-card") or soup.select(".s-item") or soup.select("li[data-view='mi:1686']")
    is_card_format = bool(soup.select(".s-card"))
    
    # DIAGNOSTIC
    if len(items) <= 1:
        print("⚠️ 0 items trouvés (Block ou Sélecteur HS)")
        print(f"Title: {soup.title.text if soup.title else 'No Title'}")
        
        # Save HTML for debugging
        try:
            with open("debug_dump.html", "w", encoding="utf-8") as f:
                f.write(response.text)
            print("-> Saved HTML to 'debug_dump.html'")
        except Exception as e:
            print(f"-> Could not save debug HTML: {e}")
        
        # Fallback recursive (Sold -> Active)
        if "LH_Sold=1" in url:
            print("🔄 Tentative repli sur les annonces actives...")
            parsed = urlparse(url)
            qs = parse_qs(parsed.query)
            qs.pop('LH_Sold', None)
            qs.pop('LH_Complete', None)
            new_query = urlencode(qs, doseq=True)
            fallback_url = urlunparse(parsed._replace(query=new_query))
            return scrape_ebay(fallback_url)
        return []

    print(f"Items bruts trouvés: {len(items)} (format: {'s-card' if is_card_format else 's-item'})")

    data = []
    skipped_unavailable = 0

    for i, item in enumerate(items):
        # Skip invalid items based on format
        if is_card_format:
            if "s-card" not in str(item.get('class', [])):
                continue
        else:
            if "s-item__wrapper" not in str(item):
                continue

        # FILTRE DE DISPONIBILITÉ - Vérification immédiate
        if not is_listing_active(item, is_sold_search=is_sold_search):
            skipped_unavailable += 1
            continue

        # Get title element based on format
        if is_card_format:
            title_elem = item.select_one(".s-card__title")
        else:
            info = item.select_one(".s-item__info") or item
            title_elem = info.select_one(".s-item__title") or info.select_one("h3")

        if not title_elem:
            continue

        # Clean title text
        title = title_elem.text.strip()
        # Remove accessibility text and prefixes
        title = re.sub(r"La page s'ouvre dans une nouvelle fenêtre ou un nouvel onglet", "", title)
        title = re.sub(r"Opens in a new window or tab", "", title)
        title = re.sub(r"^Nouvelle annonce\s*", "", title)
        title = re.sub(r"^New Listing\s*", "", title)
        title = title.strip()

        # Skip promotional items
        if "Shop on eBay" in title or "Boutique sur eBay" in title:
            continue

        # Get price
        price = extract_price(item)

        # Fallback: regex extraction if price is 0
        if price == 0:
            text_content = item.text.replace('\xa0', ' ').replace(' ', '')
            match = re.search(r"(\d+([.,]\d+)?)EUR", text_content) or re.search(r"EUR(\d+([.,]\d+)?)", text_content)
            if match:
                try:
                    price = float(match.group(1).replace(',', '.'))
                except ValueError:
                    pass

        # Get link
        link_elem = item.select_one("a.s-card__link") or item.select_one("a.s-item__link") or item.select_one("a")
        link = link_elem['href'].split("?")[0] if link_elem and link_elem.get('href') else "#"

        # Get image
        img_elem = item.select_one("img")
        image = "N/A"
        if img_elem:
            image = img_elem.get('src') or img_elem.get('data-src') or "N/A"
            image = image.replace('s-l225.jpg', 's-l500.jpg').replace('s-l140.webp', 's-l500.webp')

        # Extract Date and Condition
        date_val = extract_date(item)
        condition_val = extract_condition(item)

        if price > 0:
            data.append({
                "title": title,
                "price": price,
                "shipping": 0.0,
                "totalPrice": price,
                "date": date_val,
                "condition": condition_val,
                "link": link,
                "image": image,
                "source": "ebay"
            })

    if skipped_unavailable > 0:
        print(f"⚠️ {skipped_unavailable} annonces filtrées (indisponibles/terminées)")
    print(f"✅ Succès: {len(data)} items actifs extraits")
    return data

def save_to_csv(data, output_path):
    if not data: return

    os.makedirs(os.path.dirname(output_path) or '.', exist_ok=True)

    with open(output_path, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        writer.writerow(["Nom du Produit", "Prix Total", "Date de vente", "Condition", "Image", "Lien"])
        for item in data:
            writer.writerow([
                item["title"],
                item["totalPrice"],
                item["date"],
                item["condition"],
                item["image"],
                item["link"]
            ])
    print(f"💾 Sauvegardé dans: {output_path}")

if __name__ == "__main__":
    target_url = sys.argv[1] if len(sys.argv) > 1 else "https://www.ebay.fr/sch/i.html?_nkw=ps5+console"
    scraped_data = scrape_ebay(target_url)
    
    # Utilisation de ta fonction de nommage
    filename = sys.argv[2] if len(sys.argv) > 2 else generer_nom_fichier(target_url)
    
    save_to_csv(scraped_data, filename)
