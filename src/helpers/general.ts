import AWS, { AWSError } from "aws-sdk";
import { DescribeStacksOutput } from "aws-sdk/clients/cloudformation";
import { PromiseResult } from "aws-sdk/lib/request";
import { loadArg } from "./utils/loadArg";

export const stackName = loadArg({
  cliArg: "stack",
  processEnvName: "CFN_STACK_NAME",
});

const profile = loadArg({
  cliArg: "profile",
  processEnvName: "AWS_PROFILE",
  defaultValue: "default",
});

export const region = loadArg({
  cliArg: "region",
  processEnvName: "AWS_REGION",
  defaultValue: "eu-west-2",
});

let creds;

if (
  process.env.AWS_ACCESS_KEY_ID !== undefined &&
  process.env.AWS_SECRET_ACCESS_KEY !== undefined
) {
  creds = new AWS.Credentials({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN,
  });
} else {
  creds = new AWS.SharedIniFileCredentials({
    profile,
    callback: (err) => {
      if (err) {
        console.error(`SharedIniFileCreds Error: ${err.name} - ${err.message}`);
      }
    },
  });
}

AWS.config.credentials = creds;
AWS.config.region = region;

export const AWSClient = AWS;

const cloudformation = new AWSClient.CloudFormation();

export const getStackResources = (
  stack: string | undefined
): Promise<void | PromiseResult<DescribeStacksOutput, AWSError>> =>
  cloudformation
    .describeStacks({ StackName: stack })
    .promise()
    .catch((error) => {
      console.error(error);
    });

const apigateway = new AWSClient.APIGateway();
let apiKey: string | null = null;

interface GetOptionsOutput {
  method: string;
  headers: { "x-api-key": string | null; "Content-Type": string };
}

export const getOptions = async (): Promise<void | GetOptionsOutput> => {
  if (apiKey === null) {
    const resources = await cloudformation
      .listStackResources({ StackName: stackName })
      .promise();

    const stackResourceSummaries = resources.StackResourceSummaries;
    if (stackResourceSummaries === undefined) {
      return;
    }

    const stackResourceSummary = stackResourceSummaries.find(
      (r) => r.ResourceType === "AWS::ApiGateway::ApiKey"
    );

    if (stackResourceSummary === undefined) {
      return;
    }

    const id = stackResourceSummary.PhysicalResourceId;

    if (id === undefined) {
      return;
    }
    const params = {
      apiKey: id,
      includeValue: true,
    };

    const data = await apigateway.getApiKey(params).promise();
    apiKey = data.value !== undefined ? data.value : null;
  }

  return {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
    },
  };
};
