import requests
import json
from pprint import pformat

BASE_ROUTE = 'http://localhost:3001'
# BASE_ROUTE = "http://13.124.230.55:3001"
PRODUCT_ROUTE = '/api/product/fetch-all'


def main():
    response = requests.get(url=BASE_ROUTE+PRODUCT_ROUTE)
    if response.status_code != 200:
        print("[*] Error :: Unable to fetch data from the server.")
        return

    map_file = {}
    products = json.loads(response.text)

    for product in products:
        if product['category'] not in map_file.keys():
            map_file[product['category']] = {}

        if not product['end_year']:
            product['end_year'] = 2019
        years = range(product['start_year'], product['end_year']+1)
        for year in years:
            # Create year if not exist:
            if year not in map_file[product['category']].keys():
                map_file[product['category']][year] = {}

            # Create brand if not exist:
            if product['brand'] not in map_file[product['category']][year].keys():
                map_file[product['category']][year][product['brand']] = []

            # Add model if not exist:
            if product['model'] not in map_file[product['category']][year][product['brand']]:
                map_file[product['category']][year][product['brand']].append(
                    product['model'])

    with open("output.json", 'w') as fp:
        fp.write(str(map_file))


if __name__ == "__main__":
    main()
