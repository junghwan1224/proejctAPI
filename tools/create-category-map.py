import requests
import json
from pprint import pprint

BASE_ROUTE = 'http://localhost:3001'
PRODUCT_ROUTE = '/api/product/fetch-all'


def main():
    response = requests.get(url=BASE_ROUTE+PRODUCT_ROUTE)
    if response.status_code != 200:
        print("[*] Error :: Unable to fetch data from the server.")
        return

    map_file = {}

    products = json.loads(response.text)
    for product in products:
        if not product['end_year']:
            product['end_year'] = 2019
        years = range(product['start_year'], product['end_year']+1)
        for year in years:
            # Create year if not exist:
            if year not in map_file.keys():
                map_file[year] = {}

            # Create brand if not exist:
            if product['brand'] not in map_file[year].keys():
                map_file[year][product['brand']] = []

            # Add model if not exist:
            if product['model'] not in map_file[year][product['brand']]:
                map_file[year][product['brand']].append(product['model'])

    pprint(map_file)


if __name__ == "__main__":
    main()
