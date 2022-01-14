import { AWSClient } from "helpers/general";
import { testResult, TestResultOutput } from "utils/testResult";
import { isNoSuchBucketError, isNoSuchKeyError } from "../utils";

export default {
  // Import & use s3 type ?
  async toHaveContentEqualTo(
    { bucketName, objectName }: { bucketName: string; objectName: string },
    content: Record<string, unknown> | string
  ): Promise<TestResultOutput> {
    const s3 = new AWSClient.S3();
    const params = {
      Bucket: bucketName,
      Key: objectName,
    };

    let message;
    try {
      const object = await s3.getObject(params).promise();
      if (JSON.stringify(object.Body) === JSON.stringify(content)) {
        message = `expected ${objectName} to have content ${JSON.stringify(
          content
        )}`;

        return testResult(message, true);
      }
      const stringifiedObjectBody = object.Body?.toString();
      if (stringifiedObjectBody === undefined) {
        message = `expected ${objectName} to have content ${JSON.stringify(
          content
        )}, but content found was undefined`;

        return testResult(message, false);
      }

      message = `expected ${objectName} to have content ${JSON.stringify(
        content
      )}, but content found was ${stringifiedObjectBody}`;

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
