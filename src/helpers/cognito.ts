import { CognitoIdentityServiceProvider } from "aws-sdk";
import { AWSClient } from "./general";
import { Chance } from "chance";

interface User {
  username: string;
  password: string;
  confirmed?: boolean | undefined;
}

interface CreateUserInput {
  clientId: string;
  userPoolId: string;
  confirmed: boolean;
}

interface ConfirmUserInput {
  userPoolId: string;
  username: string;
  password: string;
}

const createUser = async (
  clientId: string,
  username: string
): Promise<User> => {
  const cognitoClient: CognitoIdentityServiceProvider = new AWSClient.CognitoIdentityServiceProvider();
  const chance = new Chance();
  const password: string = chance.string({ length: 8 });
  await cognitoClient
    .signUp({
      ClientId: clientId,
      Username: username,
      Password: chance.string({ length: 8 }),
    })
    .promise();
  console.log({ username, password });

  return {
    username,
    password,
  };
};

const confirmUser = async (input: ConfirmUserInput): Promise<User> => {
  const cognitoClient: CognitoIdentityServiceProvider = new AWSClient.CognitoIdentityServiceProvider();

  await cognitoClient
    .adminConfirmSignUp({
      UserPoolId: input.userPoolId,
      Username: input.username,
    })
    .promise();

  console.log({ username: input.username, password: input.password });

  return {
    username: input.username,
    password: input.password,
    confirmed: true,
  };
};

export const createUnauthenticatedUser = async (
  input: CreateUserInput
): Promise<User> => {
  const chance = new Chance();
  const username: string = chance.email();
  const user: User = await createUser(input.clientId, username);

  if (input.confirmed) {
    return await confirmUser({
      userPoolId: input.userPoolId,
      username: username,
      password: user.password,
    });
  }

  return {
    username: username,
    password: user.password,
    confirmed: input.confirmed,
  };
};

export const createAuthenticatedUser = async (
  input: CreateUserInput
): Promise<CognitoIdentityServiceProvider.AdminConfirmSignUpResponse> => {
  const cognitoClient: CognitoIdentityServiceProvider = new AWSClient.CognitoIdentityServiceProvider();
  const chance = new Chance();
  const username: string = chance.email();

  const user: User = await createUser(input.clientId, username);
  console.log({ username });

  await confirmUser({
    userPoolId: input.userPoolId,
    username: username,
    password: user.password,
  });

  console.log({ username: user.username, password: user.password });

  const auth: CognitoIdentityServiceProvider.AdminInitiateAuthResponse = await cognitoClient
    .adminInitiateAuth({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: input.clientId,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: user.password,
      },
    })
    .promise();

  return {
    username,
    password: user.password,
    idToken: auth.AuthenticationResult?.IdToken,
    accessToken: auth.AuthenticationResult?.AccessToken,
  };
};
