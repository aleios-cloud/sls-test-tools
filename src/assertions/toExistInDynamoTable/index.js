import { AWSClient } from "../../helpers/general";

export default {
  async toExistInDynamoTable({ PK, SK }, tableName) {
    const docClient = new AWSClient.DynamoDB.DocumentClient();

    if (!docClient) {
      return {
        message: () => "expected table to contain document client",
        pass: false,
      };
    }

    if (!SK) {
      const queryParams = {
        TableName: tableName,
        KeyConditionExpression: "#pk = :pk",
        ExpressionAttributeNames: {
          "#pk": "PK",
        },
        ExpressionAttributeValues: {
          ":pk": PK,
        },
        Limit: 1,
      };

      const result = await docClient.query(queryParams).promise();
      return {
        message: () => `expected to find ${PK} in ${tableName}`,
        pass: result.Count === 1,
      };
    }

    const getParams = {
      TableName: tableName,
      Key: {
        PK,
        SK,
      },
    };
    const result = await docClient.get(getParams).promise();
    return {
      message: () => `expected to find ${PK} in ${tableName}`,
      pass: result.Item !== undefined,
    };
  },
};
