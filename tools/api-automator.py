import requests
import sys
from requests import ConnectionError


def main():
    automator = Automator()
    # response = automator.request('ADMIN', '/admin/account-level', 'post',
    #                              id='GOLD',
    #                              discount_rate=0.03
    #                              )
    response = automator.request('USER', '/account', 'POST')


class Automator:
    def __init__(self, server="http://localhost:3001"):
        self._server = server

        self._API_map = {
            'USER': [
                {
                    'route': '/account',
                    'method': 'POST',
                    'mendatory_params': {
                        'phone': str,
                        'password': str,
                        'name': str,
                        'type': int
                    },
                    'selective_params': {
                        'crn': str,
                        'email': str
                    }
                }
            ],
            'ADMIN': [
                {
                    'route': '/admin/account-level',
                    'method': 'POST',
                    'mendatory_params': {
                        'id': str,
                        'discount_rate': float
                    },
                    'selective_params': {}
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
            API['mendatory_params'], API['selective_params'], **kwargs)

        # Execute the API:
        return self._send_request(API['route'], API['method'], params)

    def _param_selector(self, permission_type, route, method, mendatory_params,
                        selective_params, **kwargs):
        message = "[*] Requesting a [{METHOD}] call to [{ROUTE}] " + \
                  "with the permission `{PERMISSION}`"
        print(message.format(METHOD=method.upper(), ROUTE=route,
                             PERMISSION=permission_type.upper()
                             ))
        # Filter out unsupported params:
        params = {}
        for key in kwargs.keys():
            if key not in list(mendatory_params.keys())+list(selective_params.keys()):
                print('    :: Ignoring unsupported key ' +
                      '`{KEY}`...'.format(
                          KEY=key, ROUTE=route, METHOD=method
                      ))
                del kwargs[key]

        # Append keys to the `params` with specified data type:
        for key in kwargs.keys():
            if key in mendatory_params.keys():
                params[key] = mendatory_params[key](kwargs[key])
            elif key in selective_params.keys():
                params[key] = selective_params[key](kwargs[key])

        # If mendatory params are not given, ask for the value:
        for key in mendatory_params.keys():
            if key not in params.keys():
                x = input('    :: Key ' +
                          '<{KEY} :{TYPE}> :  '.format(
                              KEY=key,
                              TYPE=mendatory_params[key].__name__,
                              ROUTE=route,
                              METHOD=method))
                params[key] = mendatory_params[key](x)

        # Return params:
        return params

    def _send_request(self, endpoint, method, params):
        # Send request based on the given method:
        try:
            if method.upper() == 'POST':
                response = requests.post(url=self._server+endpoint,
                                         data=params)
                print('    => STATUS {}'.format(response.status_code))
                return response
            elif method.upper() == 'GET':
                response = requests.get(url=self._server+endpoint,
                                        data=params)
                print('    => STATUS {}'.format(response.status_code))
                return response

            elif method.upper() == 'PUT':
                response = requests.put(url=self._server+endpoint,
                                        data=params)
                print('    :: STATUS {}'.format(response.status_code))
                return response

            elif method.upper() == 'DELETE':
                response = requests.delete(url=self._server+endpoint,
                                           data=params)
                print('    :: STATUS {}'.format(response.status_code))
                return response
            else:
                print(
                    '[*] Error: Unsupported endpoint `{}`.'.format(endpoint.upper()))
                sys.exit(0)

        except ConnectionError:
            print('[*] CONNECTION ERROR :: Please check server status or route.')
            sys.exit(0)


if __name__ == "__main__":
    main()
