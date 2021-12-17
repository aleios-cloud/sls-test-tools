import { AWSClient } from "../../helpers/general";
import { testResult } from "../../utils/testResult";

export default {
  async toHaveContentEqualTo({ bucketName, objectName }: any, content: any) {
    const s3 = new AWSClient.S3();
    const params = {
      Bucket: bucketName,
      Key: objectName,
    };

    let message;
    try {
      const object = await s3.getObject(params).promise();
      if (JSON.stringify(object.Body) === JSON.stringify(content)) {
        message = `expected ${objectName} to have content ${content}`;

        return testResult(message, true);
      }
      message = `expected ${objectName} to have content ${content}, but content found was ${object.Body}`;

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
