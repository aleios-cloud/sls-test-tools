import { AWSClient } from "../../helpers/general";

export default {
  async toHaveS3ObjectWithContentTypeEqualTo(
    bucketName,
    objectName,
    contentType
  ) {
    const s3 = new AWSClient.S3();
    const params = {
      Bucket: bucketName,
      Key: objectName,
    };

    const testResult = (message, pass) => ({
      message: () => message,
      pass,
    });

    let message;
    try {
      const object = await s3.getObject(params).promise();
      if (object.ContentType === contentType) {
        message = `expected ${objectName} to have content type ${contentType}`;
        return testResult(message, true);
      }
      message = `expected ${objectName} to have content type ${contentType}, but content type found was ${object.ContentType}`;
      return testResult(message, false);
    } catch (error) {
      if (error.code === "NoSuchKey") {
        message = `expected ${bucketName} to have object with name ${objectName} - not found`;
        return testResult(message, false);
      }
      if (error.code === "NoSuchBucket") {
        message = `expected ${bucketName} to exist - not found`;
        return testResult(message, false);
      }
      throw error;
    }
  },
};
