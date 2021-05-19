import { AWSClient } from '../../helpers/general';

export default {
  async toHaveS3ObjectWithNameEqualTo(bucketName, objectName) {
    const s3 = new AWSClient.S3();
    const params = {
      Bucket: bucketName,
      Key: objectName,
    };

    let testResult;
    try {
      await s3.getObject(params).promise();
      testResult = {
        message: () =>
          `expected ${bucketName} to have object with name ${objectName}`,
        pass: true,
      };
    } catch (error) {
      if (error.code === 'NoSuchKey') {
        testResult = {
          message: () =>
            `expected ${bucketName} to have object with name ${objectName} - not found`,
          pass: false,
        };
      } else {
        throw error;
      }
    }

    return testResult;
  },
};
