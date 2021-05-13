import { AWSClient, region } from "./general";

export default class EventBridge {
  async init(eventBridgeName) {
    this.eventBridgeClient = new AWSClient.EventBridge();
    this.eventBridgeName = eventBridgeName;
    this.sqsClient = new AWSClient.SQS();
    const queueName = `${eventBridgeName}-testing-queue`;
    const queueResult = await this.sqsClient
      .createQueue({
        QueueName: queueName,
      })
      .promise();

    this.QueueUrl = queueResult.QueueUrl;

    const accountId = this.QueueUrl.split("/")[3];
    const sqsArn = `arn:aws:sqs:${region}:${accountId}:${queueName}`;
    const pattern = {
      account: [`${accountId}`],
    };

    const ruleName = `test-${eventBridgeName}-rule`;
    await this.eventBridgeClient
      .putRule({
        Name: ruleName,
        EventBusName: eventBridgeName,
        EventPattern: JSON.stringify(pattern),
        State: "ENABLED",
      })
      .promise();

    await this.eventBridgeClient
      .putTargets({
        EventBusName: eventBridgeName,
        Rule: ruleName,
        Targets: [
          {
            Arn: sqsArn,
            Id: "1",
          },
        ],
      })
      .promise();

    const policy = {
      Version: "2008-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: {
            Service: "events.amazonaws.com",
          },
          Action: "SQS:SendMessage",
          Resource: sqsArn,
        },
      ],
    };

    await this.sqsClient
      .setQueueAttributes({
        Attributes: {
          Policy: JSON.stringify(policy),
        },
        QueueUrl: this.QueueUrl,
      })
      .promise();
  }

  static async build(eventBridgeName) {
    const eventBridge = new EventBridge();
    await eventBridge.init(eventBridgeName);
    return eventBridge;
  }

  async publishEvent(source, detailType, detail) {
    const result = await this.eventBridgeClient
      .putEvents({
        Entries: [
          {
            EventBusName: this.eventBridgeName,
            Source: source,
            DetailType: detailType,
            Detail: detail,
          },
        ],
      })
      .promise();

    return result;
  }

  async getEvents() {
    // Long poll SQS queue
    const queueParams = {
      QueueUrl: this.QueueUrl,
      WaitTimeSeconds: 5,
    };

    const result = await this.sqsClient.receiveMessage(queueParams).promise();

    return result;
  }

  async clear() {
    const result = await this.sqsClient
      .purgeQueue({
        QueueUrl: this.QueueUrl,
      })
      .promise();

    return result;
  }

  async destroy() {
    const result = await this.sqsClient
      .deleteQueue({
        QueueUrl: this.QueueUrl,
      })
      .promise();

    return result;
  }
}
