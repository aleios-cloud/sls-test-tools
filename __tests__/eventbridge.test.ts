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

  test("destroy helper should delete queue, and eventbus rules & targets.", async () => {
    let rules;
    let targets;
    const busName = "destroyTestingEventBus";
    const testingAwsEventBridgeClient = new AWSEventBridge({
      region: "eu-west-2",
    });
    // creating event bus
    await testingAwsEventBridgeClient
      .createEventBus({
        Name: busName,
      })
      .promise();
    const testingSlsEventBridgeClient = await EventBridge.build(busName);
    // get rules and check that rule has been created
    rules = await testingSlsEventBridgeClient.eventBridgeClient
      ?.listRules({
        EventBusName: busName,
      })
      .promise();
    expect(rules?.Rules?.length).toBeGreaterThan(0);
    // get rule targets and see that target has been assigned to rule
    targets = await testingSlsEventBridgeClient.eventBridgeClient
      ?.listTargetsByRule({
        EventBusName: busName,
        Rule: testingSlsEventBridgeClient.ruleName || `test-${busName}-rule`,
      })
      .promise();
    expect(targets?.Targets?.length).toBeGreaterThan(0);
    const testingSqsClient = new SQS();
    let queueExists = true;
    // check that queue exists
    let attributes = (
      await testingSqsClient
        .getQueueAttributes({
          QueueUrl: slsEventBridgeClient.QueueUrl || "",
        })
        .promise()
    ).Attributes;
    attributes === undefined ? (queueExists = true) : (queueExists = false);
    expect(queueExists).toBe(true);
    // call destroy
    await testingSlsEventBridgeClient.destroy();

    // check that there are no more rules
    rules = await testingSlsEventBridgeClient.eventBridgeClient
      ?.listRules({
        EventBusName: busName,
      })
      .promise();
    expect(rules?.Rules?.length).toBe(0);
    // check that the queue no longer exists
    attributes = (
      await testingSqsClient
        .getQueueAttributes({
          QueueUrl: slsEventBridgeClient.QueueUrl || "",
        })
        .promise()
    ).Attributes;
    attributes === undefined ? (queueExists = false) : (queueExists = true);
    expect(queueExists).toBe(false);
    await testingAwsEventBridgeClient
      .deleteEventBus({ Name: busName })
      .promise();
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
