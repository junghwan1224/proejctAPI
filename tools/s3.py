import boto3


class S3:
    def __init__(self, ACCESS_KEY, SECRET_KEY, BUCKET_NAME):
        self._conn = boto3.client(
            's3',
            aws_access_key_id=ACCESS_KEY,
            aws_secret_access_key=SECRET_KEY
        )
        self._bucket_name = BUCKET_NAME

    def read(self, prefix=""):
        try:
            return self._conn.list_objects(Bucket=self._bucket_name,
                                           Prefix=prefix)['Contents']
        except KeyError:
            return []

    def create(self, local_addr, remote_addr):
        remote_addr = remote_addr[0:] if remote_addr.startswith(
            '/') else remote_addr
        return self._conn.upload_file(local_addr, self._bucket_name,
                                      remote_addr)

    def delete(self, remote_addr):
        remote_addr = remote_addr[0:] if remote_addr.startswith(
            '/') else remote_addr
        return self._conn.delete_object(Bucket=self._bucket_name,
                                        Key=remote_addr)
