import { AWSClient } from "helpers/general";
import { CognitoIdentityServiceProvider } from "aws-sdk";
import { testResult, TestResultOutput } from "utils/testResult";

export interface UserWithAttributes {
  Username: string;
  address?: { [key: string]: unknown };
  birthdate?: string;
  email?: string;
  family_name?: string;
  gender?: string;
  given_name?: string;
  locale?: string;
  middle_name?: string;
  name?: string;
  nickname?: string;
  phone_number?: string;
  picture?: string;
  preferred_username?: string;
  profile?: string;
  updated_at?: { [key: string]: unknown };
  website?: string;
  zoneinfo?: string;
}

export default {
  async toContainUserWithAttributes(
    userPoolId: string,
    userWithAttributes: UserWithAttributes
  ): Promise<TestResultOutput> {
    const cognitoClient: CognitoIdentityServiceProvider = new AWSClient.CognitoIdentityServiceProvider();
    try {
      const user: CognitoIdentityServiceProvider.AdminGetUserResponse = await cognitoClient
        .adminGetUser({
          UserPoolId: userPoolId,
          Username: userWithAttributes.Username,
        })
        .promise();

      Object.entries(userWithAttributes).forEach(([key, val]) => {
        if (key !== "Username") {
          user.UserAttributes?.forEach((attributeObject) => {
            if (attributeObject.Name === key) {
              if (attributeObject.Value !== val) {
                return testResult(
                  `User's ${key} is expected to be ${val}, but is ${attributeObject.Value}.`,
                  false
                );
              }
            }
          });
        }
      });

      return testResult(
        `User with username ${userWithAttributes.Username} exists in User Pool with Id ${userPoolId}`,
        true
      );
    } catch (e) {
      console.log(e);

      return testResult(
        `User with username ${userWithAttributes.Username} does not exist in User Pool with Id ${userPoolId}`,
        false
      );
    }
  },
};
