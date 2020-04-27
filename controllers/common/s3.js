const AWS = require("aws-sdk");

AWS.config.update({
  accessKeyId: process.env.S3_KEY,
  secretAccessKey: process.env.S3_SECRET,
});

exports.uploadFile = async (fileContent, mimeType, key) => {
  /**
   * Params:
   *   - fileContent: filedata Buffer
   *   - key: Remote file path
   *
   * Returns:
   *  `true` if upload is successful, otherwise `false`.
   */
  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: fileContent,
    ContentType: mimeType,
    ACL: "public-read",
  };

  try {
    await new AWS.S3().putObject(params).promise();
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

exports.readFile = async (key) => {
  /**
   * Params:
   *   - key: the absolute path of the remote file.
   *
   * Returns:
   *  an Object of data, including the file content.
   */
  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: key,
  };

  try {
    const response = await new AWS.S3().getObject(params).promise();
    return response;
  } catch (err) {
    console.log(err);
    return false;
  }
};

exports.getFileList = async (prefix) => {
  /**
   * Params:
   *   - prefix: prefix for the data. (e.g. It can be the name of directory)
   *
   * Returns:
   *  an Object of data.
   */

  const params = {
    Bucket: process.env.S3_BUCKET,
    Prefix: prefix,
  };

  try {
    const response = await new AWS.S3().listObjectsV2(params).promise();
    return response.Contents;
  } catch (err) {
    console.log(err);
    return false;
  }
};

exports.deleteFile = async (key) => {
  /**
   * Params:
   *   - key: the absolute path of the remote file.
   *
   * Returns:
   *  None, since it is impossible to figure out
   *  whether the data is deleted or not.
   */
  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: key,
  };

  try {
    await new AWS.S3().deleteObject(params).promise();
  } catch (err) {
    console.log(err);
  }
  return;
};
