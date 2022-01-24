import { AWSClient } from "helpers/general";
import { testResult, TestResultOutput } from "utils/testResult";
import { isNoSuchBucketError, isNoSuchKeyError } from "../utils";

export default {
  async toHaveContentTypeEqualTo(
    { bucketName, objectName }: { bucketName: string; objectName: string },
    contentType: string
  ): Promise<TestResultOutput> {
    const s3 = new AWSClient.S3();
    const params = {
      Bucket: bucketName,
      Key: objectName,
    };

    let message;
    try {
      const object = await s3.getObject(params).promise();
      if (object.ContentType === contentType) {
        message = `expected ${objectName} to have content type ${contentType}`;

        return testResult(message, true);
      }
      message = `expected ${objectName} to have content type ${contentType}, but content type found was ${
        object.ContentType ?? "undefined"
      }`;

      return testResult(message, false);
    } catch (error) {
      if (isNoSuchKeyError(error)) {
        message = `expected ${bucketName} to have object with name ${objectName} - not found`;

        return testResult(message, false);
      }
      if (isNoSuchBucketError(error)) {
        message = `expected ${bucketName} to exist - not found`;

        return testResult(message, false);
      }
      throw error;
    }
  },
};
