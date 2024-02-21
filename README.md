# Amazon Product Scraper

This project allows scraping product information from Amazon search results. Users search for a product into the web interface, and the service generates a CSV file containing information such as product name, rating, price, number of sales, and the product link.

## Quick Start

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Python 3.8 or higher
- Node.js and npm

### Installation

#### Backend (Flask)

1. Clone the repository and navigate to the backend folder.
   ```bash
   git clone https://github.com/cbolard/amazon-scraping-tool.git
   cd scrapping-pages-tool/backend
   ```

2. Create a virtual environment and activate it.
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
   ```

3. Install the dependencies.
   ```bash
   pip install -r requirements.txt
   ```

4. Launch the Flask server.
   ```bash
   python app.py
   ```

#### Frontend (Vue.js with Vite)

1. Navigate to the frontend folder.
   ```bash
   cd scrapping-pages-tool/frontend
   ```

2. Install npm dependencies.
   ```bash
   npm install
   ```

3. Start the development server.
   ```bash
   npm run dev
   ```

## Usage

1. Open your browser to the address provided by Vite (usually `http://localhost:3000`).
2. Search for a product into the designated field on the webpage.
3. Click the button to generate the CSV file. The download should start automatically.

## Built With

* [Flask](http://flask.pocoo.org/) - The web framework used for the backend.
* [Vue.js](https://vuejs.org/) - Used to build the user interface.
* [Vite](https://vitejs.dev/) - Frontend build tool and development server.

## Contributing

If you would like to contribute to the project, please fork the repository and create a pull request with your changes. All contributions are welcome!

## License

This project is licensed under the MIT License - see the LICENSE file for details.
