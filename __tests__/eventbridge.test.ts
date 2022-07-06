import { EventBridge as AWSEventBridge } from "aws-sdk";
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

  test("toHaveEvent should fail if event is not created", async () => {
    await slsEventBridgeClient.publishEvent(
      "TestSource",
      "TestDetailType",
      JSON.stringify({ Detail: "TestDetail" }),
      false
    );
    await slsEventBridgeClient.getEvents();
    const events = await slsEventBridgeClient.getEvents();
    expect(events).not.toHaveEvent();
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
    await awsEventBridgeClient
      .deleteEventBus({ Name: "TestEventBus" })
      .promise();
  });
});
