from flask import Flask, request, send_file, jsonify
from scraper import scrape_ebay, save_to_csv, generer_nom_fichier
from flask_cors import CORS
import os

app = Flask(__name__, static_folder='../frontend/dist', static_url_path='/')
CORS(app, resources={r"/api/*": {"origins": "*", "methods": ["GET", "POST", "OPTIONS"], "allow_headers": ["Content-Type"]}})

@app.route('/api/search', methods=['POST'])
def search():
    try:
        data = request.json
        print(f"[API] Received search request: {data}", flush=True)

        url = data.get('url')
        if not url:
            return jsonify({"error": "URL is required"}), 400

        print(f"[API] Scraping URL: {url}", flush=True)
        results = scrape_ebay(url)
        print(f"[API] Scraper returned {len(results)} items", flush=True)

        if results:
            print(f"[API] Sample item: {results[0]}", flush=True)

        return jsonify(results)
    except Exception as e:
        print(f"[API] Error during search: {e}", flush=True)
        return jsonify({"error": str(e)}), 500

@app.route('/generate-csv', methods=['POST'])
def generate_csv():
    data = request.json
    url = data['url']

    # Génère le nom du fichier basé sur l'URL
    nom_fichier = generer_nom_fichier(url)
    # Chemin complet du fichier dans le dossier 'pages'
    dossier = 'pages'
    csv_path = os.path.join(dossier, nom_fichier)

    # Assurez-vous que le dossier 'pages' existe
    if not os.path.exists(dossier):
        os.makedirs(dossier)

    try:
        # Appel à la fonction de scraping pour générer le CSV
        results = scrape_ebay(url)
        save_to_csv(results, csv_path)
        # Retourne le fichier CSV généré
        return send_file(csv_path, as_attachment=True, download_name=nom_fichier)
    except Exception as e:
        print(f"Error generating CSV: {e}", flush=True)
        return {"error": str(e)}, 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')

