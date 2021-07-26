import { AWSClient } from "../../helpers/general";

export default {
  async toExistAsS3Bucket(bucketName) {
    const s3 = new AWSClient.S3();
    const params = {
      Bucket: bucketName,
    };

    let testResult;
    try {
      await s3.headBucket(params).promise();
      testResult = {
        message: () => `expected S3 bucket to exist with name ${bucketName}`,
        pass: true,
      };
    } catch (error) {
      if (error.statusCode === 404) {
        testResult = {
          message: () =>
            `expected S3 bucket to exist with name ${bucketName} - not found`,
          pass: false,
        };
      } else {
        throw error;
      }
    }

    return testResult;
  },
};
