import requests
import json

BASE_ROUTE = 'http://localhost:3001'
PRODUCT_ROUTE = '/product-list?method=*'


def main():
    response = requests.get(url=BASE_ROUTE+PRODUCT_ROUTE)
    if response.status_code != 200:
        print("[*] Error :: Unable to fetch data from the server.")
        return
    map_file = {}
    products = json.loads(response.text)

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

    with open('category-map.json', 'w') as fp:
        json.dump(map_file, fp)


if __name__ == "__main__":
    main()
