import { testResult, TestResultOutput } from "utils/testResult";
import { AWSClient } from "helpers/general";
import { region } from "../../helpers/general";

export default {
  async toContainItemWithValues(
    tableName: string,
    values: { [key: string]: unknown }
  ): Promise<TestResultOutput> {
    const docClient = new AWSClient.DynamoDB.DocumentClient({
      region: region,
    });
    const keys: { pk: unknown; sk?: unknown } = { pk: values["PK"] };
    if (values["SK"] !== undefined) {
      keys.sk = values["SK"];
    }
    const queryParams = {
      Key: keys,
      TableName: tableName,
    };
    let allMatched = true;
    let itemExists = true;
    try {
      const result = await docClient.get(queryParams).promise();
      Object.entries(values).forEach(([key, val]) => {
        if (result.Item !== undefined) {
          if (key in result.Item) {
            if (result.Item[key] !== val) {
              allMatched = false;
            }
          }
        } else {
          itemExists = false;
        }
      });
      if (!itemExists) {
        return testResult(`Item does not exist.`, false);
      } else if (!allMatched) {
        return testResult(`Some values do not match as expected.`, false);
      } else {
        return testResult("Item exists with expected values", true);
      }
    } catch (e: any) {
      console.log(e);

      return testResult("Item with specified keys does not exist.", false);
    }
  },
};
