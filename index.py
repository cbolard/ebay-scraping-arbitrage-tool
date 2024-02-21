import requests
import sys
from urllib.parse import urlparse, parse_qs
from bs4 import BeautifulSoup
import csv

# Fonction pour générer le nom du fichier à partir de l'URL
def generer_nom_fichier(url):
    # Analyse l'URL
    parsed_url = urlparse(url)
    # Extrait le nom de domaine
    nom_domaine = parsed_url.netloc.split('.')[1]  # Prend le deuxième élément après avoir divisé par '.'
    # Extrait le terme de recherche de la query string
    query_string = parse_qs(parsed_url.query)
    terme_recherche = query_string.get('k', [''])[0].replace(' ', '-')  # Remplace les espaces par des tirets
    # Formate le nom du fichier
    nom_fichier = f"{nom_domaine}_{terme_recherche}.csv"
    return nom_fichier

# Vérifie si un argument d'URL a été fourni
if len(sys.argv) > 1:
    url = sys.argv[1]
else:
    url = 'https://www.amazon.fr/s?k=serveur+nas'  # URL par défaut

# Génère le nom du fichier basé sur l'URL
filename = generer_nom_fichier(url)

headers = {
    'User-Agent': 'Ton User-Agent ici',
}

response = requests.get(url, headers=headers)

# Vérifie que la requête s'est bien passée
if response.status_code == 200:
    html_content = response.text
else:
    print(f"Erreur lors de la requête: {response.status_code}")
    sys.exit(1)  # Arrête le script si la requête a échoué

soup = BeautifulSoup(html_content, 'html.parser')

# Sélectionner les éléments contenant les produits
products = soup.findAll("div", {"class": "s-result-item"})

data = []

for product in products:
    # Extraire les informations du produit
    name = product.find("span", {"class": "a-size-base-plus a-color-base a-text-normal"}).text.strip()[:50] if product.find("span", {"class": "a-size-base-plus a-color-base a-text-normal"}) else "N/A"
    rating = product.find("span", {"class": "a-icon-alt"}).text.strip() if product.find("span", {"class": "a-icon-alt"}) else "N/A"
    price = product.find("span", {"class": "a-price-whole"}).text.strip() if product.find("span", {"class": "a-price-whole"}) else "N/A"
    sells = product.find("span", {"class": "a-size-base s-underline-text"}).text.strip() if product.find("span", {"class": "a-size-base s-underline-text"}) else "N/A"
    link = "https://www.amazon.fr" + product.find("a", {"class": "a-link-normal"})['href'] if product.find("a", {"class": "a-link-normal"}) else "N/A"
    
    data.append([name, rating, price, sells, link])

# Sauvegarde des données dans le fichier CSV
with open(filename, mode='w', newline='', encoding='utf-8') as file:
    writer = csv.writer(file)
    writer.writerow(["Nom du Produit", "Note", "Prix", "Ventes", "Lien"])
    writer.writerows(data)

print(f"Les données ont été sauvegardées dans {filename}")