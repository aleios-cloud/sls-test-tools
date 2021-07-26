import { AWSClient } from "../../helpers/general";
import { testResult } from "../../utils/testResult";

export default {
  async toExistAsS3Bucket(bucketName) {
    const s3 = new AWSClient.S3();
    const params = {
      Bucket: bucketName,
    };

    let message;
    try {
      await s3.headBucket(params).promise();
      message = `expected S3 bucket to exist with name ${bucketName}`;
      return testResult(message, true);
    } catch (error) {
      if (error.statusCode === 404) {
        message = `expected S3 bucket to exist with name ${bucketName} - not found`;
        return testResult(message, false);
      }
      throw error;
    }
  },
};
