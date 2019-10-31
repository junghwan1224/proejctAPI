import requests
import uuid
from random import randrange
from hashlib import md5

# SERVER_BASE = 'http://13.124.230.55:3001'  # e.g. 'http://localhost:3001'
SERVER_BASE = 'http://localhost:3001'
ROUTE = None
ABSTRACT_ROUTE = '/api/product/abstract/create'
PRODUCT_ROUTE = '/api/product/create'


def main():
    product_list = get_product_list()
    # POST_request(data=[product_list], key='oen')

    for raw_product in product_list:
        abstract = {}

        abstract['id'] = str(uuid.uuid4()).upper()
        abstract['image'] = ''
        abstract['maker'] = raw_product['maker']
        abstract['maker_number'] = str(
            md5(str(randrange(103432400, 904134890))
                .encode('utf-8')).hexdigest().upper()[:randrange(4, 9)])
        abstract['stock'] = randrange(0, 1200)
        abstract['type'] = raw_product['description']

        print(abstract)
        response = requests.post(url=SERVER_BASE+ABSTRACT_ROUTE,
                                 data={
                                     'id': abstract['id'],
                                     'image': abstract['image'],
                                     'maker': abstract['maker'],
                                     'maker_number': abstract['maker_number'],
                                     'stock': abstract['stock'],
                                     'type': abstract['type'],
                                 })
        abstract_id = response.json()['id']
        product = {}
        product['abstract_id'] = abstract_id
        product['brand'] = raw_product['brand']
        product['model'] = raw_product['model']
        product['oe_number'] = raw_product['oen']
        product['start_year'] = raw_product['start_year']
        product['end_year'] = raw_product['end_year']
        product['engine'] = 'G2.0'
        product['price'] = raw_product['price']
        product['discount_rate'] = 0
        product['quality_cert'] = ''
        product['memo'] = ''
        product['description'] = ''

        response = requests.post(url=SERVER_BASE+PRODUCT_ROUTE,
                                 data={
                                     'abstract_id': product['abstract_id'],
                                     'brand': product['brand'],
                                     'model': product['model'],
                                     'oe_number': product['oe_number'],
                                     'start_year': product['start_year'],
                                     'end_year': product['end_year'],
                                     'engine': product['engine'],
                                     'price': product['price'],
                                     'discount_rate': product['discount_rate'],
                                     'quality_cert': product['quality_cert'],
                                     'memo': product['memo'],
                                     'description': product['description']
                                 })

        print(response)

    # for product in product_list:
    #     response = requests.post(url=SERVER_BASE+ABSTRACT_ROUTE,
    #                              data={
    #                                  'id': str(uuid.uuid4()).upper(),
    #                                  'price': int(product['price']/10)*10,
    #                                  'discount_rate:': 0,
    #                                  'stock': randrange(0, 100),
    #                                  'maker': product['maker'],
    #                                  'maker_number': '',
    #                                  'image': '',
    #                                  'type': product['description'],
    #                                  'description': '',
    #                                  'quality_cert': '',
    #                              })
    #     print(response.json())
    #     abstract_id = (response.json()['id'])
    #     response = requests.post(url=SERVER_BASE+PRODUCT_ROUTE,
    #                              data={
    #                                  'abstract_id': abstract_id,
    #                                  'brand': product['brand'],
    #                                  'model': product['model'],
    #                                  'oen': product['oen'],
    #                                  'start_year': product['start_year'],
    #                                  'end_year': product['end_year'],
    #                                  'engine': '',
    #                              })
    #     print('[*] [{}/{}] Adding product {}... '.format(product_list.index(product) +
    #                                                      1, len(product_list), product['oen']))


def POST_request(data, key=None):
    """
    [Description]:
        This function sends multiple POST requests to the server.

    [Params]:
        -----------------------------------------------------------------------
        data  |  <list>  | list of multiple dictionaries
        key   |  <str>   | one key of the dictionary (debugging purpose)

    [Returns]:
        None
    """

    for item in data:
        response = requests.post(url=SERVER_BASE + ROUTE, data=item)
        print("[*] [{}/{}] POST CALL ({}: {}) returned status code {}.".format(
            data.index(item) + 1,
            len(data),
            key,
            item[key],
            response.status_code
        ))

    print("[*] Operation complete.") if len(data) else None


def get_product_list():
    """
    [Description]:
        This function reads data from `sample_product.csv` and convert them
        into a list of dictionaries. Each dictionary has the following keys:
        {
            brand: <str>
            model: <str>
            oen: <str>
            price: <int>
            start_year: <int>
            end_year: <int>
            description: <str>
        }

    [Params]:
        None

    [Returns]:
        None
    """

    product_list = []

    with open('./sample_product.csv') as fp:
        data = fp.read()

    for row in data.strip().split('\n')[1:]:
        brand, model, year, oen, price, dtype, maker = [
            x.strip() for x in row.split(',')]

        # Fabricate strings:
        brand = brand.upper()
        model = model.upper()
        oen = oen.upper()
        maker = maker.upper()

        # Fabricate price:
        price = int(int(price)/10)*10 + \
            1 if int(price[-1]) >= 5 else int(int(price)/10)*10 + 10

        # Fabricate start year:
        start_year = int(
            '20'+year[:2]) if int(year[0]) < 3 else int('19'+year[:2])

        # Fabricate end year:
        end_year = year[3:] if len(year) == 5 else None
        if not end_year:
            pass
        elif int(end_year[0]) < 3:
            end_year = int('20'+end_year)
        else:
            end_year = int('19'+end_year)

        # Append the product to the list:
        item = {}
        item['brand'] = brand
        item['model'] = model
        item['oen'] = oen
        item['price'] = price
        item['start_year'] = start_year
        item['end_year'] = end_year
        item['description'] = dtype
        item['maker'] = maker
        product_list.append(item)

    return product_list


if __name__ == "__main__":
    main()
