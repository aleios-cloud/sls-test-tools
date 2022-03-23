import { CognitoIdentityServiceProvider } from "aws-sdk";
import { AWSClient } from "./general";
import { Chance } from "chance";
import { AttributeType } from "aws-sdk/clients/cognitoidentityserviceprovider";

interface User {
  username: string;
  password: string;
  confirmed?: boolean | undefined;
  standardAttributes?: StandardAttributes;
}

interface CreateUserInput {
  clientId: string;
  userPoolId: string;
  confirmed: boolean;
  standardAttributes?: Array<keyof StandardAttributes>;
}

interface ConfirmUserInput {
  userPoolId: string;
  username: string;
  password: string;
}

interface Address {
  formatted: string;
  street_address: string;
  locality: string;
  region: string;
  postal_code: string;
  country: string;
}

interface StandardAttributes {
  address: string;
  birthdate: string;
  email: string;
  family_name: string;
  gender: string;
  given_name: string;
  locale: string;
  middle_name: string;
  name: string;
  nickname: string;
  phone_number: string;
  picture: string;
  preferred_username: string;
  profile: string;
  updated_at: string;
  website: string;
  zoneinfo: string;
}

const createUser = async (
  createUserInput: CreateUserInput,
  username: string
): Promise<User> => {
  const cognitoClient: CognitoIdentityServiceProvider = new AWSClient.CognitoIdentityServiceProvider();
  const chance = new Chance();
  const password: string = chance.string({ length: 8 });

  const givenName = chance.first();
  const middleName = chance.first();
  const familyName = chance.last();
  const name = givenName + " " + middleName + " " + familyName;

  const country = chance.country();
  const streetAddress = chance.street();
  const locality = chance.city();
  const region = chance.province();
  const postalCode = chance.postcode();

  const formatted = [streetAddress, locality, region, postalCode, country].join(
    "\r\n"
  );

  const address: Address = {
    formatted: formatted,
    street_address: streetAddress,
    locality: locality,
    region: region,
    postal_code: postalCode,
    country: country,
  };

  const allAttributes: StandardAttributes = {
    email: chance.email(),
    birthdate: chance.date().toISOString().split("T")[0],
    family_name: familyName,
    gender: chance.gender(),
    given_name: givenName,
    locale: chance.locale(),
    middle_name: middleName,
    name: name,
    nickname: chance.string(),
    phone_number: chance.phone(),
    picture: chance.url(),
    preferred_username: chance.string(),
    profile: chance.url(),
    website: chance.url(),
    zoneinfo: chance.string(),
    address: JSON.stringify(address),
    updated_at: String(chance.timestamp()),
  };

  console.log(allAttributes.birthdate);

  console.log(createUserInput.standardAttributes);

  const attributes:
    | Array<AttributeType>
    | undefined = createUserInput.standardAttributes?.map(
    (attribute: keyof StandardAttributes) => {
      return {
        Name: attribute,
        Value: allAttributes[attribute],
      };
    }
  );

  try {
    const signUpParams: CognitoIdentityServiceProvider.Types.SignUpRequest = {
      ClientId: createUserInput.clientId,
      Username: username,
      Password: password,
      UserAttributes: attributes,
    };
    console.log(signUpParams);
    await cognitoClient.signUp(signUpParams).promise();
  } catch (e) {
    console.log(e);
    console.error(
      "Failed to create user. Please make sure the clientId is correct, and that the username is valid."
    );
  }

  return {
    username,
    password,
  };
};

const confirmUser = async (input: ConfirmUserInput): Promise<User> => {
  const cognitoClient: CognitoIdentityServiceProvider = new AWSClient.CognitoIdentityServiceProvider();

  try {
    await cognitoClient
      .adminConfirmSignUp({
        UserPoolId: input.userPoolId,
        Username: input.username,
      })
      .promise();
  } catch (e) {
    console.error(
      "Failed to confirm sign up. Please make sure the user exists."
    );
    throw e;
  }

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
  const user: User = await createUser(input, username);

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

  const user: User = await createUser(input, username);

  await confirmUser({
    userPoolId: input.userPoolId,
    username: username,
    password: user.password,
  });

  try {
    const auth: CognitoIdentityServiceProvider.InitiateAuthResponse = await cognitoClient
      .initiateAuth({
        AuthFlow: "USER_PASSWORD_AUTH",
        ClientId: input.clientId,
        AuthParameters: {
          USERNAME: user.username,
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
  } catch (e) {
    console.error(
      "Failed to authorize user - please make sure you're using the correct AuthFlow and that the user exists, and is confirmed."
    );

    throw e;
  }
};
