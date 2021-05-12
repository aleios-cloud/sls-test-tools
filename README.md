<div align="center">
  <h1>sls-test-tools</h1>


  Custom Jest Assertions for Serverless Projects
</div>

<hr />

`sls-test-tools` provides a range of utilities, setup, teardown and assertions to make it easier to write effective and high quality integration tests for Serverless Architectures on AWS using `TypeScript` & `jest`.


## Installation

With npm:
```sh
npm install --save-dev sls-test-tools
```

With yarn:
```sh
yarn add -D sls-test-tools
```

## Maintenance

sls-test-tools is currently being actively maintained. If you find a problem with the tool, let us know and we'll solve it as quickly as possible.
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
    Bucket: "my-bucket-568987656782",
    Key: `abcddcba`,
    };
    const obj = await s3.getObject(params).promise();
    expect(obj.ContentType).toBe("text/html");
    expect(obj.Body.toString()).toMatchSnapshot();
   });

```

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://medium.com/serverless-transformation"><img src="https://avatars1.githubusercontent.com/u/11080984?v=4" width="100px;" alt=""/><br /><sub><b>Ben Ellerby</b></sub></a><br /><a href="https://github.com/BenEllerby/sls-test-tools/commits?author=BenEllerby" title="Code">💻</a> <a href="#content-BenEllerby" title="Content">🖋</a> <a href="https://github.com/BenEllerby/sls-test-tools/commits?author=BenEllerby" title="Documentation">📖</a> <a href="#ideas-BenEllerby" title="Ideas, Planning, & Feedback">🤔</a> <a href="#design-BenEllerby" title="Design">🎨</a> <a href="#talk-BenEllerby" title="Talks">📢</a> <a href="https://github.com/BenEllerby/sls-test-tools/pulls?q=is%3Apr+reviewed-by%3ABenEllerby" title="Reviewed Pull Requests">👀</a></td>
    <td align="center"><a href="https://medium.com/serverless-transformation"><img src="https://avatars.githubusercontent.com/hamilton-s" width="100px;" alt=""/><br /><sub><b>Sarah Hamilton</b></sub></a><br /><a href="https://github.com/BenEllerby/sls-test-tools/commits?author=hamilton-s" title="Code">💻</a> <a href="#content-hamilton-s" title="Content">🖋</a> <a href="https://github.com/BenEllerby/sls-test-tools/commits?author=hamilton-s" title="Documentation">📖</a> <a href="#ideas-hamilton-s" title="Ideas, Planning, & Feedback">🤔</a></td>

  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
