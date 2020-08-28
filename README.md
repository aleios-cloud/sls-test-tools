# sls-test-tools

`sls-test-tools` provides a range of utilities, setup, teardown and assertions to make it easier to write effective and high quality integration tests for Serverless Architectures on AWS using `TypeScript` & `jest`.

## Status

- This project is still in the idea phase.

## Plan

## Usage

- Copy the `test-lib.js` file, along with the `package.json` to your project.

## Assertion Examples:

## Running with `jest`

- `yarn jest '-profile=default' '-stack=my-service-dev'  --runInBand`


```
async function callEndPoint(url, data, cookieToken) {
  const requestOptions = {
    ...(await getOptions()),
    data: data,
    url,
  };
  if (cookieToken) {
    requestOptions.headers.cookie = cookieToken;
  } else {
    requestOptions.headers.cookie = null;
  }
  return axios(requestOptions);
}

describe("Integration Testing: My Service", () => {
  beforeAll(async () => {
    const stacks = await getStackResources(stackName);
    const endpointOutput = stacks.Stacks[0].Outputs.find(
      (output) => output.OutputKey === "ServiceEndpoint"
    ).OutputValue;
    const endpointMatches = endpointOutput.match(
      /https:\/\/.+\.execute-api\..+\.amazonaws\.com.+/
    );
    endpoint = endpointMatches[0];
    axios.defaults.validateStatus = () => true; // prevent error codes from throwing errors
  });

  it("creates API Gateway Endpoint and URLs", async () => {
    expect(endpoint).toBeDefined();
  });

  it("returns 403 forbidden without valid api key", async () => {
    expect(endpoint).toBeDefined();
    const resp = await axios.post(endpoint);
    expect(resp.status).toBe(403);
  });

  it("returns a 200 with a correct token and object object", async () => {
    expect(endpoint).toBeDefined();
    const resp = await callEndPoint(endpoint, data);
    expect(resp.status).toBe(200);
    expect(resp.data.success).toBe(true);
  });

  it("populates the correct data in the bucket", async () => {
    const params = {
    Bucket: "bucket-name",
    Key: "key",
    };
    const obj = await s3.getObject(params).promise();
    expect(obj.ContentType).toBe("text/html");
    expect(obj.Body.toString()).toMatchSnapshot();
   });

```