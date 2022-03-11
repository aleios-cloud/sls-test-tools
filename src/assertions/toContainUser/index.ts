import { AWSClient } from "helpers/general";
import { CognitoIdentityServiceProvider } from "aws-sdk";
import { testResult, TestResultOutput } from "utils/testResult";

export default {
  async toContainUser(
    userPoolId: string,
    username: string
  ): Promise<TestResultOutput> {
    const cognitoClient: CognitoIdentityServiceProvider = new AWSClient.CognitoIdentityServiceProvider();
    try {
      await cognitoClient
        .adminGetUser({
          UserPoolId: userPoolId,
          Username: username,
        })
        .promise();

      return testResult(
        `User with username ${username} exists in User Pool with Id ${userPoolId}`,
        true
      );
    } catch (e) {
      console.log(e);

      return testResult(
        `User does not exist in User Pool with Id ${userPoolId}`,
        false
      );
    }
  },
};
