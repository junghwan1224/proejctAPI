from inspect import getframeinfo, currentframe
from modules import Automator, S3  # noqa
import uuid
from random import randrange, getrandbits
from hashlib import md5
import sys

ACCESS_KEY = ''
SECRET_KEY = ''
BUCKET_NAME = ''


def main():
    product_list = get_product_list('./sample_product.csv')
    print(product_list)

    return
    automator = Automator()
    s3 = S3(ACCESS_KEY=ACCESS_KEY, SECRET_KEY=SECRET_KEY,
            BUCKET_NAME=BUCKET_NAME)

    # # Create Default level 'NORMAL':
    validate(getframeinfo(currentframe()).lineno,
             automator.request('ADMIN', '/admin/account-level',
                               'POST', id='NORMAL', discount_rate=0))

    # # Create ANONYMOUS (비회원) account data:
    random_password = "%x" % getrandbits(512)
    validate(getframeinfo(currentframe()).lineno,
             automator.request('USER', '/account-create', 'POST',
                                       name='ANONYMOUS',
                                       password=random_password,
                                       phone='ANONYMOUS'))

    # Fetch sample product data from CSV, and add data:
    for raw_product in get_product_list('./sample_product.csv'):
        validate(getframeinfo(currentframe()).lineno,
                 automator.request('ADMIN', '/admin/product', 'POST',
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
                                   tags=raw_product['tags'],
                                   description_images=get_sample_description_images()
                                   ))

    print('----------------------------------------------------------')
    print('[*] Operation complete.')


def get_sample_attributes(attribute_type, classification):
    MAP = {'HUB_BEARING': ['하체부품'],
           'ARM_BEARING': ['하체부품', ],
           'ENGINE_OIL': ['소모품'],
           'BRAKE_PAD': ['소모품', '하체부품']}
    classification_map = {'CAR': '승용차', 'COM': '상용차'}
    return ",".join(MAP[attribute_type]+[classification_map[classification]])


def get_sample_description_images():
    sample_images = ['https://thumbnail12.coupangcdn.com/thumbnails/remote/q89/image/retail/images/2018/03/12/18/3/dd10ca05-1dfd-4e67-b6c9-0867d5ce5430.jpg',
                     'https://thumbnail11.coupangcdn.com/thumbnails/remote/q89/image/retail/images/2018/07/23/16/4/de0bac55-53bb-4355-86df-18c84980853b.jpg',
                     'https://thumbnail11.coupangcdn.com/thumbnails/remote/q89/image/retail/images/2018/12/28/16/7/ec51de1f-3fa1-44ce-b106-8b830bf88732.jpg',
                     'https://thumbnail13.coupangcdn.com/thumbnails/remote/q89/image/vendor_inventory/a066/84d8b261776a35cd70671aeb89a1d93ff19b141b2c65d26eebf80d8fe344.jpg',
                     'https://thumbnail15.coupangcdn.com/thumbnails/remote/q89/image/product/content/vendorItem/2019/05/30/448313834/ec88a4e6-a982-4c6f-bab9-25fafb7359af.jpg',
                     'https://thumbnail15.coupangcdn.com/thumbnails/remote/q89/image/retail/images/2019/05/14/17/0/9ab3741e-badf-40af-9713-1b2d1a7a2470.jpg',
                     'https://thumbnail14.coupangcdn.com/thumbnails/remote/q89/image/retail/images/2019/08/21/10/6/90031130-f162-4dfd-ac6e-89c4d72c0d10.jpg',
                     'https://thumbnail11.coupangcdn.com/thumbnails/remote/q89/image/product/content/vendorItem/2019/08/01/520542436/6d3b6ed6-0c82-4e55-825d-2cf9245e9035.jpg',
                     'https://thumbnail12.coupangcdn.com/thumbnails/remote/q89/image/retail/images/2019/10/25/17/4/a8e9269b-571b-42e0-810a-92c9b188a8eb.jpg',
                     'https://thumbnail15.coupangcdn.com/thumbnails/remote/q89/image/product/content/vendorItem/2017/11/06/160392179/d55ab7fe-b627-444a-95e7-baad7bb81168.jpg',
                     'https://thumbnail13.coupangcdn.com/thumbnails/remote/q89/image/product/content/vendorItem/2019/06/03/435615188/2a42d190-a812-47aa-b3ec-d28f1d325c48.jpg',
                     'https://thumbnail14.coupangcdn.com/thumbnails/remote/q89/image/product/content/vendorItem/2019/04/12/276324145/0409246b-3107-4211-ad73-aad40c9cd88c.jpg',
                     'https://thumbnail15.coupangcdn.com/thumbnails/remote/q89/image/product/content/vendorItem/2019/05/10/86048945/5887aa6a-728b-4a90-bbba-67c545382ddc.jpg',
                     'https://thumbnail13.coupangcdn.com/thumbnails/remote/q89/image/retail/images/256219007592664-db075c37-19a5-4b8b-be22-209a263c19cb.jpg',
                     'https://thumbnail13.coupangcdn.com/thumbnails/remote/q89/image/retail/images/2018/10/12/19/3/a085d8f6-6d00-4ded-86f3-6d1ba32df9ae.jpg',
                     'https://thumbnail13.coupangcdn.com/thumbnails/remote/q89/image/product/content/vendorItem/2019/05/17/522121914/692966ec-9f2a-4b27-b654-85bb6a4848a7.jpg',
                     'https://thumbnail12.coupangcdn.com/thumbnails/remote/q89/image/retail/images/493200132634812-139878df-b5b4-4b4a-9fc9-a0ae8b6a0a54.jpg',
                     'https://thumbnail11.coupangcdn.com/thumbnails/remote/q89/image/retail/images/2017/06/07/18/5/10e11868-0c8a-4e2a-a235-4b98f502ed09.jpg',
                     'http://image1.coupangcdn.com/image/vendor_inventory/608d/42ace008c88a847f7e6abb082cded2a1fd3734f8f53d3b324cd707a1bc88.png',
                     'https://thumbnail11.coupangcdn.com/thumbnails/remote/q89/image/product/content/vendorItem/2019/08/16/709349330/06f83086-7fd2-4b66-887b-8ece88399e78.jpg', 'https://thumbnail11.coupangcdn.com/thumbnails/remote/q89/image/product/content/vendorItem/2017/04/04/6640485/22ebaf94-890e-4a31-81d6-156ab79b87d6.jpg',
                     'http://image1.coupangcdn.com/image/vendor_inventory/e1cd/2af2b7062e033a986d91d623d0c683b21ea78cadedd6f06486e9fb5750bc.jpg',
                     'http://img1a.coupangcdn.com/image/vendor_inventory/images/2018/03/08/11/0/1d3414d1-f4db-47f8-8355-a5425c93c14e.jpeg',
                     'https://thumbnail13.coupangcdn.com/thumbnails/remote/q89/image/retail/images/2018/10/23/17/9/4f392399-d6ea-44c4-95f4-47e5fd460842.jpg',
                     'https://thumbnail12.coupangcdn.com/thumbnails/remote/q89/image/retail/images/2019/03/22/15/7/719076a9-1cc8-4f5b-8b07-7def357ef0f2.jpg',
                     'https://thumbnail15.coupangcdn.com/thumbnails/remote/q89/image/retail/images/31639121395414-290d90fb-872f-439b-a7dd-2ee266937622.jpg',
                     'https://thumbnail11.coupangcdn.com/thumbnails/remote/q89/image/retail/images/2017/09/18/10/6/51704e80-4212-4c58-aba1-03d8774dde73.jpg',
                     'https://thumbnail14.coupangcdn.com/thumbnails/remote/q89/image/retail/images/2018/11/22/14/5/58dc2d78-31b5-4afe-9e82-3c58e80a3bbe.jpg',
                     'https://thumbnail14.coupangcdn.com/thumbnails/remote/q89/image/retail/images/78515406730703-a2665a9f-e5dd-4a6d-a083-d99669c9fb96.jpg'
                     ]
    return sample_images[randrange(0, len(sample_images))]


def get_sample_images(image_type):
    DELIMITER = ','
    RATIO = {1: 0.3, 2: 0.6, 3: 0.2, 4: 0.1}
    SAMPLE_IMAGE_MAP = \
        {'HUB_BEARING': ['https://5.imimg.com/data5/CJ/AW/MY-25163333/koyo-bearing-500x500.jpg',
                         'https://image.made-in-china.com/2f0j00NGLfHgIlYncD/Timken-SKF-NSK-NTN-Koyo-Bearing-NACHI-43096-43312-07098-07196-07098-07204-07098-07205-17098-17244A-17098-17244-Tapered-Roller-Bearings.jpg',
                         'https://images-na.ssl-images-amazon.com/images/I/51y22lwhxDL._SL1010_.jpg',
                         'https://cdn.shopify.com/s/files/1/0069/7617/6241/products/60-22-2rs-motorcycle-wheel-bearing-sealed-genuine-koyo-22x44x12mm_1024x1024_2x_540x_a8e9980e-28ef-4567-ab08-0278cc52beea_540x.jpg?v=1557317286',
                         'https://images-na.ssl-images-amazon.com/images/I/51ThgHO0H0L._SX425_.jpg',
                         'https://www.dhresource.com/0x0/f2/albu/g7/M01/7F/31/rBVaSVsuPqWAO-ALAAIVORXWTu0269.jpg',
                         'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTu-3GcceG2KNNledsD22fHcUwThwcAvpEAUFVKPCO5Hq0EWW26',
                         'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcT6Vwei52HCYq4oqGhKiwGgysYQVbLRz_bH_cl1LMYtQlRvL-5i'],

         'ARM_BEARING': ['https://sep.yimg.com/ay/yhst-20865666099910/spherical-lower-control-arm-bearing-kit-part-sp-4-3.jpg',
                         'https://images-na.ssl-images-amazon.com/images/I/51Z9wJ8O9CL._AC_SX466_.jpg',
                         'https://frielatvsales.com/pub/media/catalog/product/cache/9672e2ae34eee073c652392c2f359ebe/2/8/28-1058-003_1.jpg',
                         'https://www.motorcycleid.com/ic/all-balls/items/28-1219_1.jpg',
                         'https://www.motoxmatrix.co.uk/ekmps/shops/motmatrix/images/swing-arm-bearing-and-seal-kit-suzuki-rm125-89-91-33847-p.jpg',
                         'https://sc01.alicdn.com/kf/HTB1foBLSCzqK1RjSZFpq6ykSXXa4/202476012/HTB1foBLSCzqK1RjSZFpq6ykSXXa4.jpg'],

         'BRAKE_PAD': ['https://images-na.ssl-images-amazon.com/images/I/812rlAqhCXL._AC_SX466_.jpg',
                       'https://images.homedepot-static.com/productImages/00e74f1b-f549-443f-a698-63e6823d3758/svn/centric-parts-brake-parts-104-09151-64_1000.jpg',
                       'https://cdn11.bigcommerce.com/s-coxd9/images/stencil/1280x1280/products/59304/427666/Galfer-G1054-Semi-Metallic-Front-Brake-Pads__62795.1477321668.jpg?c=2&imbypass=on',
                       'https://images-na.ssl-images-amazon.com/images/I/41xHB3u3zlL._AC_SY400_.jpg',
                       'https://5.imimg.com/data5/MV/EH/MY-36628322/ford-figo-front-brake-pad-500x500.jpg'],

         'ENGINE_OIL': ['https://i0.wp.com/baautoparts.net/wp-content/uploads/2018/07/EDGE-5W-30.jpg?fit=502%2C600&ssl=1',
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


def validate(lineno, response):
    if str(response.status_code).startswith('4') or \
            str(response.status_code).startswith('5'):
        print('----------------------------------------------------------')
        print('[*] Operation failed. (Line {}, <main>)'.format(lineno))
        sys.exit(0)


if __name__ == "__main__":
    main()
