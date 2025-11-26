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
    # Recherche de "Vendu le 26 nov. 2025"
    # D'abord dans le caption ou subtitle
    date_elem = item.select_one(".s-item__caption") or item.select_one(".s-item__subtitle")
    text_to_search = date_elem.text if date_elem else item.text
    
    match = re.search(r"Vendu le\s+(\d{1,2}\s+[a-zA-Zéû]+\.?\s+\d{4})", text_to_search, re.IGNORECASE)
    if match:
        return match.group(1)
    return "N/A"

def extract_condition(item):
    # Souvent dans .SECONDARY_INFO
    cond_elem = item.select_one(".SECONDARY_INFO")
    if cond_elem:
        return cond_elem.text.strip()
    
    # Fallback mots-clés
    text = item.text.lower()
    if "neuf" in text or "brand new" in text: return "Neuf"
    if "occasion" in text or "pre-owned" in text: return "Occasion"
    if "reconditionné" in text or "refurbished" in text: return "Reconditionné"
    if "pièces" in text or "parts" in text: return "Pour pièces"
    
    return "N/A"

def scrape_ebay(url):
    print(f"Scraping: {url} (Mode: Stealth TLS)", flush=True)
    
    # C'est ICI que la magie opère. 'impersonate="chrome120"' trompe le serveur.
    try:
        response = requests.get(
            url, 
            impersonate="chrome120",
            headers={
                'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
                'Referer': 'https://www.google.com/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
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
    
    # Sélecteur eBay standard (et fallback s-card)
    items = soup.select(".s-item") or soup.select(".s-card") or soup.select("li[data-view='mi:1686']")
    
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

    print(f"Items bruts trouvés: {len(items)}")

    data = []
    for i, item in enumerate(items): 
        # On vérifie si c'est un vrai item (support s-item et s-card)
        if "s-item__wrapper" not in str(item) and "s-card" not in str(item): 
            continue

        info = item.select_one(".s-item__info") or item.select_one(".s-card__info") or item
        if not info: 
            continue

        title_elem = info.select_one(".s-item__title") or info.select_one("h3") or info.select_one(".s-card__title")
        if not title_elem: 
            continue
        
        title = title_elem.text.strip()
        # Nettoyage du titre (suppression du suffixe d'accessibilité)
        title = title.replace("La page s'ouvre dans une nouvelle fenêtre ou un nouvel onglet", "").strip()
        
        if "Shop on eBay" in title or "Boutique sur eBay" in title: 
            continue

        price = extract_price(info)
        
        # Fallback Regex si le prix est 0
        if price == 0:
            text_content = item.text.replace('\xa0', ' ').replace(' ', '')
            match = re.search(r"(\d+([.,]\d+)?)EUR", text_content) or re.search(r"EUR(\d+([.,]\d+)?)", text_content)
            if match:
                valeur_string = match.group(1).replace(',', '.')
                try:
                    price = float(valeur_string)
                except ValueError:
                    pass

        link_elem = info.select_one("a.s-item__link") or info.select_one("a")
        link = link_elem['href'].split("?")[0] if link_elem else "#"
        
        img_elem = item.select_one(".s-item__image-img") or item.select_one("img")
        image = "N/A"
        if img_elem:
            image = img_elem.get('src') or img_elem.get('data-src') or "N/A"
            image = image.replace('s-l225.jpg', 's-l500.jpg')
            
        # Extraction Date et Condition
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

    print(f"✅ Succès: {len(data)} items extraits")
    return data

def save_to_csv(data, output_path):
    if not data: return
    
    os.makedirs(os.path.dirname(output_path) or '.', exist_ok=True)
    
    with open(output_path, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        writer.writerow(["Nom du Produit", "Prix", "Image", "Lien", "Source"])
        for item in data:
            writer.writerow([
                item["title"], item["price"], item["image"], item["link"], item["source"]
            ])
    print(f"💾 Sauvegardé dans: {output_path}")

if __name__ == "__main__":
    target_url = sys.argv[1] if len(sys.argv) > 1 else "https://www.ebay.fr/sch/i.html?_nkw=ps5+console"
    scraped_data = scrape_ebay(target_url)
    
    # Utilisation de ta fonction de nommage
    filename = sys.argv[2] if len(sys.argv) > 2 else generer_nom_fichier(target_url)
    
    save_to_csv(scraped_data, filename)
