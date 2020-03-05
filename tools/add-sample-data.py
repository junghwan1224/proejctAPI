import inspect
from automator import Automator  # noqa
import uuid
from random import randrange
from hashlib import md5
import sys


def main():
    automator = Automator()

    # Fetch sample product data (format: [<dict>, <dict>, ...]):
    product_list = get_product_list('./sample_product.csv')

    for raw_product in product_list:
        response = automator.request('ADMIN', '/admin/product', 'POST',
                                     maker=raw_product['maker'],
                                     maker_number=md5(str(randrange(1234, 1324354253)).encode(
                                         'utf-8')).hexdigest()[:randrange(8, 12)].upper(),
                                     maker_origin=raw_product['maker_origin'],
                                     type=raw_product['type'],
                                     models=raw_product['models'],
                                     oe_number=raw_product['oe_number'],
                                     stock=randrange(0, 1200),
                                     price=raw_product['price'],
                                     images=get_sample_images(
                                         raw_product['type']),
                                     attributes=get_sample_attributes(
                                         raw_product['type'], raw_product['classification']),
                                     tags=raw_product['tags'])
        tackle(response, inspect.getframeinfo(inspect.currentframe()).lineno)

    print('----------------------------------------------------------')
    print('[*] Operation complete.')


def get_sample_attributes(attribute_type, classification):
    MAP = {'허브베어링': ['하체부품'],
           '암베어링': ['하체부품', ],
           '엔진오일': ['소모품'],
           '브레이크패드': ['소모품', '하체부품']}
    classification_map = {'CAR': '승용차', 'COM': '상용차'}
    return ",".join(MAP[attribute_type]+[classification_map[classification]])


def get_sample_images(image_type):
    DELIMITER = ','
    RATIO = {1: 0.3, 2: 0.6, 3: 0.2, 4: 0.1}
    SAMPLE_IMAGE_MAP = \
        {'허브베어링': ['https://5.imimg.com/data5/CJ/AW/MY-25163333/koyo-bearing-500x500.jpg',
                   'https://image.made-in-china.com/2f0j00NGLfHgIlYncD/Timken-SKF-NSK-NTN-Koyo-Bearing-NACHI-43096-43312-07098-07196-07098-07204-07098-07205-17098-17244A-17098-17244-Tapered-Roller-Bearings.jpg',
                   'https://images-na.ssl-images-amazon.com/images/I/51y22lwhxDL._SL1010_.jpg',
                   'https://cdn.shopify.com/s/files/1/0069/7617/6241/products/60-22-2rs-motorcycle-wheel-bearing-sealed-genuine-koyo-22x44x12mm_1024x1024_2x_540x_a8e9980e-28ef-4567-ab08-0278cc52beea_540x.jpg?v=1557317286',
                   'https://images-na.ssl-images-amazon.com/images/I/51ThgHO0H0L._SX425_.jpg',
                   'https://www.dhresource.com/0x0/f2/albu/g7/M01/7F/31/rBVaSVsuPqWAO-ALAAIVORXWTu0269.jpg',
                   'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTu-3GcceG2KNNledsD22fHcUwThwcAvpEAUFVKPCO5Hq0EWW26',
                   'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcT6Vwei52HCYq4oqGhKiwGgysYQVbLRz_bH_cl1LMYtQlRvL-5i'],

         '암베어링': ['https://sep.yimg.com/ay/yhst-20865666099910/spherical-lower-control-arm-bearing-kit-part-sp-4-3.jpg',
                  'https://images-na.ssl-images-amazon.com/images/I/51Z9wJ8O9CL._AC_SX466_.jpg',
                  'https://frielatvsales.com/pub/media/catalog/product/cache/9672e2ae34eee073c652392c2f359ebe/2/8/28-1058-003_1.jpg',
                  'https://www.motorcycleid.com/ic/all-balls/items/28-1219_1.jpg',
                  'https://www.motoxmatrix.co.uk/ekmps/shops/motmatrix/images/swing-arm-bearing-and-seal-kit-suzuki-rm125-89-91-33847-p.jpg',
                  'https://sc01.alicdn.com/kf/HTB1foBLSCzqK1RjSZFpq6ykSXXa4/202476012/HTB1foBLSCzqK1RjSZFpq6ykSXXa4.jpg'],

         '브레이크패드': ['https://images-na.ssl-images-amazon.com/images/I/812rlAqhCXL._AC_SX466_.jpg',
                    'https://images.homedepot-static.com/productImages/00e74f1b-f549-443f-a698-63e6823d3758/svn/centric-parts-brake-parts-104-09151-64_1000.jpg',
                    'https://cdn11.bigcommerce.com/s-coxd9/images/stencil/1280x1280/products/59304/427666/Galfer-G1054-Semi-Metallic-Front-Brake-Pads__62795.1477321668.jpg?c=2&imbypass=on',
                    'https://images-na.ssl-images-amazon.com/images/I/41xHB3u3zlL._AC_SY400_.jpg',
                    'https://5.imimg.com/data5/MV/EH/MY-36628322/ford-figo-front-brake-pad-500x500.jpg'],

         '엔진오일': ['https://i0.wp.com/baautoparts.net/wp-content/uploads/2018/07/EDGE-5W-30.jpg?fit=502%2C600&ssl=1',
                  'https://rotella.shell.com/en_us/products/full-synthetic-and-blend-oil/t5/_jcr_content/par/productDetails/image.img.960.jpeg/1554831759681/shell-rotella-t5-promo-image.jpeg?imwidth=960',
                  'https://www.gobizkorea.com/image/goodsImage.do?goods_no=GS20180317192099&image_se_code=ADI1_THUMB10A',
                  'https://lh3.googleusercontent.com/proxy/cENugTARqtUy-iKlxDrXXEl86nILDu5XhOf-_chlEoaiID-ARkgSn3huDgWB15JUVJfRtFBso9IJOy6iKlfG7ySfDdqKZRvUPcK5mXxOp7yQyKfv2g94IFVKI7q8Gau4AzTUdkqWSw']
         }

    # Raise error if image_type is undefined:
    if image_type not in SAMPLE_IMAGE_MAP.keys():
        print("invalid image_type `{}`.".format(image_type))
        sys.exit(0)

    # Select random images according to the RATIO:
    ratio_map = []
    for key in RATIO.keys():
        ratio_map += [key]*int(100*RATIO[key])

    amount = ratio_map[randrange(0, len(ratio_map))]
    selected_images = []
    for i in range(amount):
        selected_images.append(
            SAMPLE_IMAGE_MAP[image_type][
                randrange(0, len(SAMPLE_IMAGE_MAP[image_type]))])

    return DELIMITER.join(selected_images)


def get_product_list(csv_path):
    product_list = []
    # Read csv file:
    with open(csv_path) as fp:
        data = fp.read()

    for row in data.strip().split('\n')[1:]:
        classification, models, oe_number, price, dtype, maker, maker_origin, tags = [
            x.strip() for x in row.split(',')]

        # Data should be in uppercase:
        classification = classification.upper()
        models = models.upper()
        oe_number = oe_number.upper()
        maker = maker.upper()

        # Fabricate price:
        price = int(int(price)/10)*10 + \
            10 if int(price[-1]) >= 5 else int(int(price)/10)*10

        # Append data to the list with <dict> format:
        item = {}
        item['classification'] = classification
        item['models'] = models
        item['oe_number'] = oe_number
        item['price'] = price
        item['type'] = dtype
        item['maker'] = maker
        item['maker_origin'] = maker_origin
        item['tags'] = tags
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
