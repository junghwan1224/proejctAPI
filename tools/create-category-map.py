import requests
import json
from requests.exceptions import ConnectionError
import sys

BASE_ROUTE = 'http://localhost:3001'
PRODUCT_ROUTE = '/product-list?method=*'


def main():
    # Get product data from the server:
    try:
        response = requests.get(url=BASE_ROUTE+PRODUCT_ROUTE)
        if response.status_code != 200:
            print("[*] Error :: Unable to fetch data from the server.")
            sys.exit(0)
    except ConnectionError:
        print('[*] Error :: Unable to connect to the server.')
        sys.exit(0)
    products = json.loads(response.text)

    # Create map file:
    map_file = {}
    valid_models = []
    for product in products:
        models = product['models'].split('%%')
        for model in models:
            valid_models.append(model)

    for model in valid_models:
        data = list(map(str.strip, model.split('$$')))
        car_brand = data[0].upper()
        car_model = data[1].upper()
        start_year = data[2]
        end_year = data[3]

        for year in range(int(start_year), int(end_year) + 1):
            if year not in map_file.keys():
                map_file[year] = {}

            if car_brand not in map_file[year].keys():
                map_file[year][car_brand] = []

            if car_model not in map_file[year][car_brand]:
                map_file[year][car_brand].append(car_model)

    # Sort models in ascending order:
    for brand_dict in map_file.values():
        for brand_name in brand_dict.keys():
            brand_dict[brand_name].sort()

    # Sort brands in ascending order:
        for year in map_file.keys():
            map_file[year] = dict(sorted(map_file[year].items()))

    # Save to JSON file:
    with open('category-map.json', 'w') as fp:
        json.dump(map_file, fp)


if __name__ == "__main__":
    main()
