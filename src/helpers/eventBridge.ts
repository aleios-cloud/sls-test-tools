import { AWSClient, region } from "./general";

export default class EventBridge {
  QueueUrl: any;
  eventBridgeClient: any;
  eventBridgeName: any;
  keep: any;
  ruleName: any;
  sqsClient: any;
  targetId: any;
  async init(eventBridgeName: any) {
    this.eventBridgeClient = new AWSClient.EventBridge();
    this.eventBridgeName = eventBridgeName;
    this.ruleName = `test-${eventBridgeName}-rule`;
    this.targetId = "1";

    const keepArg = process.argv.filter((x) => x.startsWith("--keep="))[0];
    this.keep = keepArg ? keepArg.split("=")[1] : false;
    this.sqsClient = new AWSClient.SQS();
    if (!this.keep) {
      console.info(
        "If running repeatedly add '--keep=true' to keep testing resources up to avoid creation throttles"
      );
    }
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

    await this.eventBridgeClient
      .putRule({
        Name: this.ruleName,
        EventBusName: eventBridgeName,
        EventPattern: JSON.stringify(pattern),
        State: "ENABLED",
      })
      .promise();

    await this.eventBridgeClient
      .putTargets({
        EventBusName: eventBridgeName,
        Rule: this.ruleName,
        Targets: [
          {
            Arn: sqsArn,
            Id: this.targetId,
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

  static async build(eventBridgeName: any) {
    const eventBridge = new EventBridge();
    await eventBridge.init(eventBridgeName);

    return eventBridge;
  }

  async publishEvent(source: any, detailType: any, detail: any) {
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

    await this.getEvents(); // need to clear this manual published event from the SQS observer queue.

    return result;
  }

  async getEvents() {
    // Long poll SQS queue
    const queueParams = {
      QueueUrl: this.QueueUrl,
      WaitTimeSeconds: 5,
    };

    const result = await this.sqsClient.receiveMessage(queueParams).promise();

    const messageHandlers = result.Messages?.map((message: any) => ({
      Id: message.MessageId,
      ReceiptHandle: message.ReceiptHandle,
    }));
    if (messageHandlers.length > 0) {
      await this.sqsClient
        .deleteMessageBatch({
          Entries: messageHandlers,
          QueueUrl: this.QueueUrl,
        })
        .promise();
    }

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
    if (!this.keep) {
      await this.sqsClient
        .deleteQueue({
          QueueUrl: this.QueueUrl,
        })
        .promise();

      await this.eventBridgeClient
        .removeTargets({
          Ids: [this.targetId],
          Rule: this.ruleName,
          EventBusName: this.eventBridgeName,
        })
        .promise();

      await this.eventBridgeClient
        .deleteRule({
          Name: this.ruleName,
          EventBusName: this.eventBridgeName,
        })
        .promise();
    } else {
      await this.clear();
    }

    return true;
  }
}
