import { EventBridge } from "aws-sdk";

describe("EventBridge assertions", () => {
  let eventBridgeClient;

  beforeAll(async () => {
    eventBridgeClient = new EventBridge({
      region: "eu-west-1",
    });
    const eventBusCreationResponse = await eventBridgeClient
      .createEventBus({
        Name: "TestEventBus",
      })
      .promise();
    console.log(eventBusCreationResponse.EventBusArn);
  });

  it("should pass", () => {
    expect(1).toBe(1);
  });

  afterAll(async () => {
    const eventBusDeletionResponse = await eventBridgeClient
      .deleteEventBus({ Name: "TestEventBus" })
      .promise();
    console.log(eventBusDeletionResponse);
  });
});
