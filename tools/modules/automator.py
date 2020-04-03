import colorama
import requests
import sys
from requests import ConnectionError

colorama.init()


class Automator:
    def __init__(self, server="http://localhost:3001"):
        self._server = server

        self._API_map = {
            'USER': [
                {
                    'route': '/account-create',
                    'method': 'POST',
                    'mandatory': {
                        'phone': str,
                        'password': str,
                        'name': str
                    },
                    'optional': {
                        'crn': str,
                        'email': str
                    }
                }
            ],
            'ADMIN': [
                {
                    'route': '/admin/account-level',
                    'method': 'POST',
                    'mandatory': {
                        'id': str,
                        'discount_rate': float
                    },
                    'optional': {}
                },
                {
                    'route': '/admin/account-level',
                    'method': 'GET',
                    'mandatory': {},
                    'optional': {}
                },
                {
                    'route': '/admin/product',
                    'method': 'POST',
                    'mandatory': {
                        'maker': str,
                        'maker_number': str,
                        'maker_origin': str,
                        'type': str,
                        'oe_number': str,
                        'models': str,
                        'stock': int,
                        'price': int
                    },
                    'optional': {
                        'images': str,
                        'description_images': str,
                        'tags': str,
                        'attributes': str,
                        'is_public': int,  # 0 or 1
                        'memo': str,
                        'quality_cert': str,
                        'allow_discount': int  # 0 or 1
                    }
                }
            ]
        }

    def request(self, permission_type, route, method, **kwargs):

        # Validate permission_type:
        if permission_type.upper() not in self._API_map.keys():
            print('[*] ERROR: Invalid key `{}` for the permission_type'.format(
                permission_type
            ))
            sys.exit(0)

        # Seek for specific API:
        API = None
        for predefined_API in self._API_map[permission_type.upper()]:
            if predefined_API['route'] == route.lower() and  \
                    predefined_API['method'] == method.upper():
                API = predefined_API
                break

        # Raise error message and halt if the given route/method was not found:
        if not API:
            print("[*] No matching API for `{}({})`.".format(route, method))
            sys.exit(0)

        # Verify parameters:
        params = self._param_selector(
            permission_type, route, method,
            API['mandatory'], API['optional'], **kwargs)

        # Execute the API:
        return self._send_request(API['route'], API['method'], params)

    def _param_selector(self, permission_type, route, method, mandatory,
                        optional, **kwargs):
        message = "[*] Requesting a [{METHOD}] call to [{ROUTE}] " + \
                  "with the permission `{PERMISSION}`"
        print(message.format(METHOD=method.upper(), ROUTE=route,
                             PERMISSION=permission_type.upper()
                             ))
        # Filter out unsupported params:
        params = {}
        deletable_keys = []
        for key in kwargs.keys():
            if key not in list(mandatory.keys())+list(optional.keys()):
                print('    :: Ignoring unsupported key ' +
                      '`{KEY}`...'.format(
                          KEY=key, ROUTE=route, METHOD=method
                      ))
                deletable_keys.append(key)
        for key in deletable_keys:
            del kwargs[key]

        # Append keys to the `params` with specified data type:
        for key in kwargs.keys():
            if key in mandatory.keys():
                params[key] = mandatory[key](kwargs[key])
            elif key in optional.keys():
                params[key] = optional[key](kwargs[key])

        # If mendatory params are not given, ask for the value:
        for key in mandatory.keys():
            if key not in params.keys():
                x = input('    :: Key ' +
                          '<{KEY} :{TYPE}> :  '.format(
                              KEY=key,
                              TYPE=mandatory[key].__name__,
                              ROUTE=route,
                              METHOD=method))
                params[key] = mandatory[key](x)

        # Return params:
        return params

    def _send_request(self, endpoint, method, params):
        # Send request based on the given method:
        try:
            # Halt if the method is inappropriate:
            if method.upper() not in ['POST', 'GET', 'PUT', 'DELETE']:
                print(
                    '[*] Error: Unsupported endpoint `{}`.'.format(endpoint.upper()))
                sys.exit(0)

            # Send request and receive response:
            if method.upper() == 'POST':
                response = requests.post(url=self._server+endpoint,
                                         data=params)
            elif method.upper() == 'GET':
                response = requests.get(url=self._server+endpoint,
                                        data=params)

            elif method.upper() == 'PUT':
                response = requests.put(url=self._server+endpoint,
                                        data=params)

            elif method.upper() == 'DELETE':
                response = requests.delete(url=self._server+endpoint,
                                           data=params)

            # Print the status
            color_code = {
                '1': colorama.Style.BRIGHT+colorama.Fore.LIGHTBLACK_EX,
                '2': colorama.Style.BRIGHT+colorama.Fore.GREEN,
                '3': colorama.Style.BRIGHT+colorama.Fore.LIGHTBLACK_EX,
                '4': colorama.Style.BRIGHT+colorama.Fore.RED,
                '5': colorama.Style.BRIGHT+colorama.Fore.BLUE
            }

            response_text = response.text
            try:
                response_text = response.json()['message']
            except:
                pass

            print('    => {COLORING} STATUS {CODE}{COLON}{RESET} {TEXT}'.format(
                COLORING=color_code[str(response.status_code)[0]],
                CODE=response.status_code,
                COLON=':' if len(response_text) else '',
                RESET=colorama.Fore.RESET+colorama.Style.RESET_ALL,
                TEXT=response_text))
            return response

        except ConnectionError:
            print('[*] CONNECTION ERROR :: Please check server status or route.')
            sys.exit(0)
