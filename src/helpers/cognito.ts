import { CognitoIdentityServiceProvider } from "aws-sdk";
import { AWSClient } from "./general";

export const createUserInUserPoolWithUsername = async (
  userPoolId: string,
  username: string
): Promise<CognitoIdentityServiceProvider.AdminCreateUserResponse> => {
  const cognitoClient: CognitoIdentityServiceProvider = new AWSClient.CognitoIdentityServiceProvider();

  return await cognitoClient
    .adminCreateUser({
      UserPoolId: userPoolId,
      Username: username,
    })
    .promise();
};
