import requests
import sys
from urllib.parse import urlparse, parse_qs
from bs4 import BeautifulSoup
import csv
import os

# Fonction pour générer le nom du fichier à partir de l'URL
def generer_nom_fichier(url):
    parsed_url = urlparse(url)
    nom_domaine = parsed_url.netloc.split('.')[1]
    query_string = parse_qs(parsed_url.query)
    terme_recherche = query_string.get('k', [''])[0].replace(' ', '-')
    return f"{nom_domaine}_{terme_recherche}.csv"

# Récupération de l'URL depuis les arguments de la ligne de commande
if len(sys.argv) > 1:
    url = sys.argv[1]
else:
    url = 'https://www.amazon.fr/s?k=serveur+nas'

headers = {'User-Agent': 'Ton User-Agent ici'}
response = requests.get(url, headers=headers)

if response.status_code != 200:
    print(f"Erreur lors de la requête: {response.status_code}")
    sys.exit(1)

soup = BeautifulSoup(response.text, 'html.parser')
products = soup.findAll("div", {"class": "s-result-item"})

data = []

for product in products:
    name = product.find("span", {"class": "a-size-base-plus a-color-base a-text-normal"}).text.strip()[:50] if product.find("span", {"class": "a-size-base-plus a-color-base a-text-normal"}) else None
    
    if name:  # Vérifie si le nom du produit existe
        rating = product.find("span", {"class": "a-icon-alt"}).text.strip() if product.find("span", {"class": "a-icon-alt"}) else "N/A"
        price_text = product.find("span", {"class": "a-price-whole"}).text.strip().replace('\u202f', '').replace(',', '.') if product.find("span", {"class": "a-price-whole"}) else "0"
        sells_text = product.find("span", {"class": "a-size-base s-underline-text"}).text.strip().replace('.', '') if product.find("span", {"class": "a-size-base s-underline-text"}) else "0"
        link = "https://www.amazon.fr" + product.find("a", {"class": "a-link-normal"})['href'] if product.find("a", {"class": "a-link-normal"}) else "N/A"
        
        # Conversion
        try:
            price = float(price_text)
        except ValueError:
            price = float('inf')  # Assigner un prix élevé en cas d'erreur pour le tri
        
        try:
            sells = int(sells_text)
        except ValueError:
            sells = 0  # Assigner 0 en cas d'erreur pour le tri

        data.append([name, rating, price, sells, link])


# Tri des données
data_sorted = sorted(data, key=lambda x: (-x[3], x[2]))

# Préparation du fichier CSV
dossier = 'pages'
if not os.path.exists(dossier):
    os.makedirs(dossier)

filename = os.path.join(dossier, generer_nom_fichier(url))

# Écriture dans le fichier CSV
with open(filename, mode='w', newline='', encoding='utf-8') as file:
    writer = csv.writer(file)
    writer.writerow(["Nom du Produit", "Note", "Prix", "Ventes", "Lien"])
    writer.writerows(data_sorted)

print(f"Les données ont été sauvegardées dans {filename}")
