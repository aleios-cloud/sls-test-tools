import { AWSClient } from "../../helpers/general";
import { testResult } from "../../utils/testResult";

export default {
  async toHaveS3ObjectWithNameEqualTo(bucketName, objectName) {
    const s3 = new AWSClient.S3();
    const params = {
      Bucket: bucketName,
      Key: objectName,
    };

    let message;
    try {
      await s3.getObject(params).promise();
      message = `expected ${bucketName} to have object with name ${objectName}`;
      return testResult(message, true);
    } catch (error) {
      if (error.code === "NoSuchKey") {
        message = `expected ${bucketName} to have object with name ${objectName} - not found`;
        return testResult(message, false);
      }
      throw error;
    }
  },
};
