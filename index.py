import requests
from bs4 import BeautifulSoup
import csv

# URL de la page à scraper
url = 'https://www.amazon.fr/s?k=serveur+nas'

headers = {
    'User-Agent': 'Ton User-Agent ici',
}

response = requests.get(url, headers=headers)

# Vérifie que la requête s'est bien passée
if response.status_code == 200:
    html_content = response.text
else:
    print(f"Erreur lors de la requête: {response.status_code}")

soup = BeautifulSoup(html_content, 'html.parser')

# Sélectionner les éléments contenant les produits
products = soup.findAll("div", {"class": "s-result-item"})

data = []

for product in products:
    # Nom du produit
    name = product.find("span", {"class": "a-size-base-plus a-color-base a-text-normal"}).text.strip()[:50] if product.find("span", {"class": "a-size-base-plus a-color-base a-text-normal"}) else "N/A"

    
    # Note du produit
    rating = product.find("span", {"class": "a-icon-alt"}).text.strip() if product.find("span", {"class": "a-icon-alt"}) else "N/A"
    
    # Prix
    price = product.find("span", {"class": "a-price-whole"}).text.strip() if product.find("span", {"class": "a-price-whole"}) else "N/A"
    
    
    # Nombre de ventes
    sells = product.find("span", {"class": "a-size-base s-underline-text"}).text.strip() if product.find("span", {"class": "a-size-base s-underline-text"}) else "N/A"
    
    # Lien du produit
    link = "https://www.amazon.fr" + product.find("a", {"class": "a-link-normal"})['href'] if product.find("a", {"class": "a-link-normal"}) else "N/A"
    
    data.append([name, rating, price, sells, link])


# Nom du fichier CSV de sortie
filename = 'produits_amazon.csv'



with open(filename, mode='w', newline='', encoding='utf-8') as file:
    writer = csv.writer(file)
    writer.writerow(["Nom du Produit", "Note", "Prix",  "Ventes", "Lien"])
    writer.writerows(data)

print(f"Les données ont été sauvegardées dans {filename}")



