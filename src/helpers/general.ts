import AWS, { AWSError } from "aws-sdk";
import { DescribeStacksOutput } from "aws-sdk/clients/cloudformation";
import { PromiseResult } from "aws-sdk/lib/request";

const profileArg = process.argv.filter((x) => x.startsWith("--profile="))[0];
const profile = profileArg ? profileArg.split("=")[1] : "default";
const stackArg = process.argv.filter((x) => x.startsWith("--stack="))[0];
const regionArg = process.argv.filter((x) => x.startsWith("--region="))[0];
export const region = regionArg ? regionArg.split("=")[1] : "eu-west-2";

export const stackName = stackArg.split("=")[1];

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

// make async? not necessary?
export const pollOnCondition = (
  condition: boolean,
  timeoutValue: number
): void => {
  const start = Date.now();
  while (!(Date.now() - start < timeoutValue)) {
    if (condition) {
      break;
    } else {
      continue;
    }
  }
};
