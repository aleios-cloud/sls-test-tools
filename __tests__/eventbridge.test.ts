import { EventBridge as AWSEventBridge, SQS } from "aws-sdk";
import EventBridge from "../src/helpers/eventBridge";

describe("EventBridge assertions", () => {
  let awsEventBridgeClient: AWSEventBridge;
  let slsEventBridgeClient: EventBridge;

  beforeAll(async () => {
    awsEventBridgeClient = new AWSEventBridge({
      region: "eu-west-2",
    });
    await awsEventBridgeClient
      .createEventBus({
        Name: "TestEventBus",
      })
      .promise();
    slsEventBridgeClient = await EventBridge.build("TestEventBus");
  });

  test("toHaveEvent should pass if event is created", async () => {
    await slsEventBridgeClient.publishEvent(
      "TestSource",
      "TestDetailType",
      JSON.stringify({ Detail: "TestDetail" }),
      false
    );
    const events = await slsEventBridgeClient.getEvents();
    expect(events).toHaveEvent();
  });

  test("toHaveEvent should fail if event is not present", async () => {
    await slsEventBridgeClient.publishEvent(
      "TestSource",
      "TestDetailType",
      JSON.stringify({ Detail: "TestDetail" }),
      false
    );
    await new Promise((resolve) => setTimeout(resolve, 3000));
    await slsEventBridgeClient.clear();
    await new Promise((resolve) => setTimeout(resolve, 60000));
    const events = await slsEventBridgeClient.getEvents();
    expect(events).not.toHaveEvent();
  });

  test("toHaveEventWithSource should pass if event is created with correct source", async () => {
    await slsEventBridgeClient.publishEvent(
      "TestSource",
      "TestDetailType",
      JSON.stringify({ Detail: "TestDetail" }),
      false
    );
    const events = await slsEventBridgeClient.getEvents();
    expect(events).toHaveEventWithSource("TestSource");
  });

  test("toHaveEventWithSource should pass if event is created with wrong source", async () => {
    await slsEventBridgeClient.publishEvent(
      "TestSource1",
      "TestDetailType",
      JSON.stringify({ Detail: "TestDetail" }),
      false
    );
    const events = await slsEventBridgeClient.getEvents();
    expect(events).not.toHaveEventWithSource("TestSource");
  });

  test("toHaveEventWithSource should fail if event is not created", async () => {
    await slsEventBridgeClient.clear();
    await new Promise((resolve) => setTimeout(resolve, 60000));
    const events = await slsEventBridgeClient.getEvents();
    expect(events).not.toHaveEventWithSource("TestSource");
  });

  test("clear helper should delete events off queue", async () => {
    await slsEventBridgeClient.publishEvent(
      "TestSource1",
      "TestDetailType1",
      JSON.stringify({ Detail: "TestDetail1" }),
      false
    );
    await slsEventBridgeClient.publishEvent(
      "TestSource2",
      "TestDetailType2",
      JSON.stringify({ Detail: "TestDetail2" }),
      false
    );
    await new Promise((resolve) => setTimeout(resolve, 3000));
    await slsEventBridgeClient.clear();
    await new Promise((resolve) => setTimeout(resolve, 60000));
    const events = await slsEventBridgeClient.getEvents();
    expect(events?.Messages?.length).toBe(undefined);
  });

  afterAll(async () => {
    await awsEventBridgeClient
      .removeTargets({
        EventBusName: "TestEventBus",
        Rule: slsEventBridgeClient.ruleName || `test-TestEventBus-rule`,
        Ids: ["1"],
      })
      .promise();
    await awsEventBridgeClient
      .deleteRule({
        EventBusName: "TestEventBus",
        Name: slsEventBridgeClient.ruleName || `test-TestEventBus-rule`,
      })
      .promise();
    const sqsClient = new SQS();
    if (slsEventBridgeClient.QueueUrl === undefined) {
      throw new Error("QueueUrl is undefined");
    } else {
      await sqsClient
        .deleteQueue({
          QueueUrl: slsEventBridgeClient.QueueUrl || "",
        })
        .promise();
    }
    await awsEventBridgeClient
      .deleteEventBus({ Name: "TestEventBus" })
      .promise();
  });
});
