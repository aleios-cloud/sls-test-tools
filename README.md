<div align="center">
  <h1>sls-test-tools</h1>
  ![installTool](./img/logo.png)

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

## Assertions:

### EventBridge

```
    expect(eventBridgeEvents).toHaveEvent();

    expect(eventBridgeEvents).toHaveEventWithSource("order.created");
```
## Helpers

### General

```
AWSClient - An AWS client with credentials set up

getStackResources(stackName) - get information about a stack
getOptions() - get options for making requests to AWS
```

### EventBridge

#### Static
```
    EventBridge.build(busName) - create a EventBridge instance with helper functionns
```
    
#### Instance
```
    eventBridge.publishEvent(source, detailType, detail) - publish an event to the bus
    eventBridge.getEvents() - get the events that have been sent to the bus
    eventBridge.clear() - clear old messages
    eventBridge.destroy() - remove infastructure used to track events
```

## Running with `jest`

- `yarn jest '-profile=default' '-stack=my-service-dev' --runInBand`

```

describe("Integration Testing Event Bridge", () => {
  beforeAll(async () => {
    eventBridge = await EventBridge.build("event-bridge")
  });

  afterAll(async () => {
    await eventBridge.destroy()
  });

  it("lambda publish event correctly", async () => {
    const event = {
      body: JSON.stringify({
        filename: filename,
      }),
    };

    // Invoke Lambda Function
    const params = {
      FunctionName: "event-bridge-example-dev-service1",
      Payload: JSON.stringify(event),
    };
    await lambda.invoke(params).promise();

    const eventBridgeEvents = await eventBridge.getEvents()
    expect(eventBridgeEvents).toHaveEvent();
    expect(eventBridgeEvents).toHaveEventWithSource("order.created");
  });

  it("pdf is saved when an order is created", async () => {
    await eventBridge
      .publishEvent("order.created", "example", JSON.stringify({ filename: filename }));

    await sleep(5000); // wait 5 seconds to allow event to pass

    const params = {
      Bucket: "example-dev-thumbnails-bucket",
      Key: filename,
    };

    // Assert that file was added to the S3 bucket
    const obj = await s3.getObject(params).promise();
    expect(obj.ContentType).toBe("application/pdf");
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
    <td align="center"><a href="https://github.com/agwhi"><img src="https://avatars.githubusercontent.com/agwhi" width="100px;" alt=""/><br /><sub><b>Alex White</b></sub></a><br /><a href="https://github.com/BenEllerby/sls-test-tools/commits?author=agwhi" title="Code">💻</a><a href="https://github.com/BenEllerby/sls-test-tools/commits?author=agwhi" title="Documentation">📖</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
