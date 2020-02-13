import inspect
from automator import Automator
import uuid
from random import randrange
from hashlib import md5
import sys


def main():
    automator = Automator()

    # Add default user level:
    response = automator.request('ADMIN', '/admin/account-level', 'POST',
                                 id='NORMAL', discount_rate=0)
    tackle(response, inspect.getframeinfo(inspect.currentframe()).lineno)

    # Add sample users:
    response = automator.request('USER', '/account', 'POST',
                                 name="박정환",
                                 phone="‭01024569959‬",
                                 password='1234',
                                 type=11)
    tackle(response, inspect.getframeinfo(inspect.currentframe()).lineno)
    response = automator.request('USER', '/account', 'POST',
                                 name="정구현",
                                 phone="01024733891",
                                 password='1234',
                                 type=11)
    tackle(response, inspect.getframeinfo(inspect.currentframe()).lineno)

    # Fetch sample product data (format: [<dict>, <dict>, ...]):
    product_list = get_product_list('./sample_product.csv')

    for raw_product in product_list:
        # Add sample product-abstracts:
        response = automator.request(
            'ADMIN', '/admin/product-abstract', 'POST',
            image='https://localhost:3001/sample.png',
            maker=raw_product['maker'],
            maker_number=str(
                md5(str(randrange(103432400, 904134890))
                    .encode('utf-8')).hexdigest().upper()[:randrange(4, 9)]),
            stock=randrange(0, 1200),
            type=raw_product['type']
        )
        tackle(response, inspect.getframeinfo(inspect.currentframe()).lineno)

        # Add sample products:
        response = automator.request('ADMIN', '/admin/product', 'POST',
                                     abstract_id=response.json()['id'],
                                     category=raw_product['category'],
                                     brand=raw_product['brand'],
                                     model=raw_product['model'],
                                     oe_number=raw_product['oe_number'],
                                     start_year=raw_product['start_year'],
                                     end_year=raw_product['end_year'],
                                     engine='G2.0',
                                     price=raw_product['price'],
                                     quality_cert='',
                                     memo='',
                                     description='',
                                     is_public=1)
        tackle(response, inspect.getframeinfo(inspect.currentframe()).lineno)

    print('----------------------------------------------------------')
    print('[*] Operation complete.')


def get_product_list(csv_path):
    product_list = []
    # Read csv file:
    with open(csv_path) as fp:
        data = fp.read()
    for row in data.strip().split('\n')[1:]:
        category, brand, model, year, oe_number, price, dtype, maker = [
            x.strip() for x in row.split(',')]

        # Data should be in uppercase:
        category = category.upper()
        brand = brand.upper()
        model = model.upper()
        oe_number = oe_number.upper()
        maker = maker.upper()

        # Fabricate price:
        price = int(int(price)/10)*10 + \
            10 if int(price[-1]) >= 5 else int(int(price)/10)*10

        # Fabricate start year and end year:
        start_year = int(
            '20'+year[:2]) if int(year[0]) < 3 else int('19'+year[:2])
        end_year = year[3:]
        if int(end_year[0]) < 3:
            end_year = int('20'+end_year)
        else:
            end_year = int('19'+end_year)

        # Append data to the list with <dict> format:
        item = {}
        item['category'] = category
        item['brand'] = brand
        item['model'] = model
        item['oe_number'] = oe_number
        item['price'] = price
        item['start_year'] = start_year
        item['end_year'] = end_year
        item['type'] = dtype
        item['maker'] = maker
        product_list.append(item)

    return product_list


def tackle(response, lineno):

    if str(response.status_code).startswith('4') or \
            str(response.status_code).startswith('5'):
        print('----------------------------------------------------------')
        print('[*] Operation failed. (Line {}, <main>)'.format(lineno))
        sys.exit(0)


if __name__ == "__main__":
    main()
