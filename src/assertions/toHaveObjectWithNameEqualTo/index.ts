import { AWSClient } from "helpers/general";
import { testResult, TestResultOutput } from "utils/testResult";
import { isNoSuchKeyError } from "../utils";

export default {
  async toHaveS3ObjectWithNameEqualTo(
    bucketName: string,
    objectName: string
  ): Promise<TestResultOutput> {
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
      if (isNoSuchKeyError(error)) {
        message = `expected ${bucketName} to have object with name ${objectName} - not found`;

        return testResult(message, false);
      }
      throw error;
    }
  },
};
