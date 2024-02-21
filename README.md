
# Scraper de Produits Amazon

Ce projet permet de scraper des informations de produits à partir de recherches effectuées sur Amazon. L'utilisateur copie et colle l'URL de la recherche Amazon dans l'interface web, et le service génère un fichier CSV contenant des informations telles que le nom du produit, la note, le prix, le nombre de ventes, et le lien vers le produit.

## Démarrage rapide

Ces instructions vous permettront d'obtenir une copie du projet en cours d'exécution sur votre machine locale à des fins de développement et de test.

### Prérequis

- Python 3.8 ou supérieur
- Node.js et npm

### Installation

#### Backend (Flask)

1. Clonez le dépôt et naviguez dans le dossier du backend.
   ```bash
   git clone https://votreDepot.git](https://github.com/cbolard/amazon-scraping-tool.git)
   cd scrapping-pages-tool/backend
   ```

2. Créez un environnement virtuel et activez-le.
   ```bash
   python -m venv venv
   source venv/bin/activate  # Sur Windows, utilisez `venv\Scripts\activate`
   ```

3. Installez les dépendances.
   ```bash
   pip install -r requirements.txt
   ```

4. Lancez le serveur Flask.
   ```bash
   python app.py
   ```

#### Frontend (Vue.js avec Vite)

1. Naviguez dans le dossier frontend.
   ```bash
   cd scrapping-pages-tool/frontend
   ```

2. Installez les dépendances npm.
   ```bash
   npm install
   ```

3. Lancez le serveur de développement.
   ```bash
   npm run dev
   ```

## Utilisation

1. Ouvrez votre navigateur à l'adresse indiquée par Vite (généralement `http://localhost:3000`).
2. Copiez et collez l'URL d'une recherche Amazon dans le champ prévu à cet effet sur la page web.
3. Cliquez sur le bouton pour générer le fichier CSV. Le téléchargement devrait commencer automatiquement.

## Construit avec

* [Flask](http://flask.pocoo.org/) - Le framework web utilisé pour le backend.
* [Vue.js](https://vuejs.org/) - Utilisé pour construire l'interface utilisateur.
* [Vite](https://vitejs.dev/) - Outil de build et serveur de développement pour le frontend.

## Contribuer

Si vous souhaitez contribuer au projet, veuillez forker le dépôt et créer une pull request avec vos modifications. Toutes les contributions sont les bienvenues !

## Licence

Ce projet est sous licence MIT - voir le fichier LICENSE pour plus de détails.

## Remerciements

* Merci à tous ceux qui ont contribué au projet !
* Inspiré par les nombreuses possibilités offertes par l'API d'Amazon.
