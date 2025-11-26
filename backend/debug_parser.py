from bs4 import BeautifulSoup
import warnings
import sys
warnings.filterwarnings("ignore")

def parse_debug_html(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        html = f.read()
    
    soup = BeautifulSoup(html, 'html.parser')
    products = soup.findAll("div", {"data-component-type": "s-search-result"})
    
    print(f"Found {len(products)} products")
    
    target_asin = "B0D9C1BVFS"
    for product in products:
        if product.get('data-asin') == target_asin:
            print(f"--- Product {target_asin} ---")
            # Find all elements containing '459'
            for element in product.find_all(string=lambda text: text and '459' in text):
                parent = element.parent
                print(f"Found '459' in: Tag={parent.name}, Class={parent.get('class')}")
                print("Parent HTML:")
                print(parent.prettify())
            break
    else:
        print(f"Product {target_asin} not found.")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        parse_debug_html(sys.argv[1])
    else:
        print("Usage: python debug_parser.py <path_to_html>")
