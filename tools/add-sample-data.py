from modules import S3, Automator  # noqa
from samples.data import sample_products  # noqa
import os
from hashlib import md5
from random import random, randrange
import sys

ACCESS_KEY = 'AKIA2DUQVPGWY2QDDFMV'
SECRET_KEY = '8lG6JNtRP1x7AHiSEHGGxqTBoGwaCO8QKlc7UBiD'
BUCKET_NAME = 'montar-static-resources'
IMAGES_PATH = 'samples/images'
DETAIL_PATH = 'samples/details'
URL_PATH = 'https://montar-static-resources.s3.ap-northeast-2' + \
    '.amazonaws.com/{DIRECTORY}/{FILENAME}'


def main():
    automator = Automator()
    s3 = S3(ACCESS_KEY, SECRET_KEY, BUCKET_NAME)
    products = sample_products
    sample_images = os.listdir(IMAGES_PATH)
    sample_details = os.listdir(DETAIL_PATH)

    for product in products:
        # Get sample images and upload them to S3 server:
        images = []
        type_list = list(filter(lambda x: x.startswith(product['type']),
                                sample_images))
        for i in range(randrange(1, 5)):  # random quantity between 1 ~ 5
            local_path = type_list[randrange(0, len(type_list))]
            local_fullpath = os.path.join(IMAGES_PATH, local_path)
            url = upload_image(s3, local_fullpath, 'product-image')
            images.append(url)

        # Get sample detail images and upload them to S3 server:
        local_fullpath = os.path.join(
            DETAIL_PATH,
            sample_details[randrange(0, len(sample_details))])
        description_image = upload_image(s3, local_fullpath, 'product-detail')

        data = {
            'maker': product['maker'],
            'maker_number': create_maker_number(),
            'maker_origin': product['maker_origin'],
            'type': product['type'],
            'models': product['models'],
            'oe_number': product['oe_number'],
            'stock': randrange(0, 1200),
            'price': product['price'],
            'images': ",".join(images),
            'attributes': get_sample_attributes(
                product['type'], product['classification']),
            'tags': product['tags'],
            'description_images': description_image}

        res = automator.request('ADMIN', '/admin/product', 'POST', **data)
        if res.status_code != 201:
            print('STATUS CODE [{}] on [{}, {}]'.format(
                res.status_code,
                product['oe_number'],
                product['maker']))
            sys.exit(0)


def create_maker_number():
    return md5(str(randrange(1234, 1324354253)).encode(
        'utf-8')).hexdigest()[:randrange(8, 12)].upper()


def get_sample_attributes(attribute_type, classification):
    MAP = {'HUB_BEARING': ['하체부품'],
           'ARM_BEARING': ['하체부품', ],
           'ENGINE_OIL': ['소모품'],
           'BRAKE_PAD': ['소모품', '하체부품']}
    classification_map = {'CAR': '승용차', 'COM': '상용차'}
    return ",".join(MAP[attribute_type]+[classification_map[classification]])


def upload_image(s3, local_path, DIRECTORY):
    FILENAME = '{}.{}'.format(
        md5(str(random()).encode('utf-8')).hexdigest().upper() +
        md5(str(random()).encode('utf-8')).hexdigest().upper(),
        local_path.split('/')[-1].split('.')[-1]
    )

    # Upload sample images:
    try:
        s3.upload(local_path, '{}/{}'.format(DIRECTORY, FILENAME))
    except:
        print('[*] Unable to upload file to S3 server.')
        sys.exit(0)
    return URL_PATH.format(DIRECTORY=DIRECTORY, FILENAME=FILENAME)


if __name__ == "__main__":
    main()
