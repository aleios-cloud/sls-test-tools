import { AWSClient } from "helpers/general";
import { testResult, TestResultOutput } from "utils/testResult";
import { is404Error } from "../utils";

export default {
  async toExistAsS3Bucket(bucketName: string): Promise<TestResultOutput> {
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
      if (is404Error(error)) {
        message = `expected S3 bucket to exist with name ${bucketName} - not found`;

        return testResult(message, false);
      }
      throw error;
    }
  },
};
