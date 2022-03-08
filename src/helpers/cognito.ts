import { CognitoIdentityServiceProvider } from "aws-sdk";
import { AWSClient } from "./general";
import { Chance } from "chance";

export const createUnauthenticatedUser = async (
  clientId: string
): Promise<CognitoIdentityServiceProvider.SignUpResponse> => {
  const cognitoClient: CognitoIdentityServiceProvider = new AWSClient.CognitoIdentityServiceProvider();
  const chance = new Chance();
  const username = chance.email();

  return await cognitoClient
    .signUp({
      ClientId: clientId,
      Username: username,
      Password: chance.string({ length: 8 }),
    })
    .promise();
};

class AuthenticatedUser {}

export const createAuthenticatedUser = async (
  clientId: string,
  userPoolId: string
): Promise<CognitoIdentityServiceProvider.AdminConfirmSignUpResponse> => {
  const cognitoClient: CognitoIdentityServiceProvider = new AWSClient.CognitoIdentityServiceProvider();
  const chance = new Chance();
  const username: string = chance.email();
  const password: string = chance.string({ length: 8 });

  //   const signUpResponse: CognitoIdentityServiceProvider.SignUpResponse =
  const res: CognitoIdentityServiceProvider.SignUpResponse = await cognitoClient
    .signUp({
      ClientId: clientId,
      Username: username,
      Password: password,
    })
    .promise();

  console.log(res);

  await cognitoClient
    .adminConfirmSignUp({
      UserPoolId: userPoolId,
      Username: username,
    })
    .promise();

  const auth: CognitoIdentityServiceProvider.InitiateAuthResponse = await cognitoClient
    .initiateAuth({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: clientId,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
      },
    })
    .promise();

  return {
    username,
    password,
    idToken: auth.AuthenticationResult.IdToken,
    accessToken: auth.AuthenticationResult.AccessToken,
  };
};
