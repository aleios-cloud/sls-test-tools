/* eslint-disable max-lines */
import { AWSError, EventBridge as AWSEventBridge, SQS } from "aws-sdk";
import { PromiseResult } from "aws-sdk/lib/request";
import { AWSClient, region } from "./general";
import { removeUndefinedMessages } from "./utils/removeUndefinedMessages";

export default class EventBridge {
  QueueUrl: string | undefined;
  eventBridgeClient: AWSEventBridge | undefined;
  eventBridgeName: string | undefined;
  keep: boolean | undefined;
  ruleName: string | undefined;
  sqsClient: SQS | undefined;
  targetId: string | undefined;

  async init(eventBridgeName: string): Promise<void> {
    this.eventBridgeClient = new AWSClient.EventBridge();
    this.eventBridgeName = eventBridgeName;
    this.ruleName = `test-${eventBridgeName}-rule`;
    this.targetId = "1";

    const keepArg = process.argv.filter((x) => x.startsWith("--keep="))[0];
    const keepArgEnabled = keepArg ? keepArg.split("=")[1] === "true" : false;
    const keepEnvVarEnabled = !!process.env.SLS_TEST_TOOLS_KEEP;
    this.keep = keepArgEnabled || keepEnvVarEnabled;
    const ruleNameArg = process.argv.filter((x) => x.startsWith("--event-rule-name="))[0];
    this.ruleName = ruleNameArg ? ruleNameArg.split("=")[1] : `test-${eventBridgeName}-rule`;
    const queueNameArg = process.argv.filter((x) => x.startsWith("--queue-name="))[0];
    const queueName = queueNameArg ? queueNameArg.split("=")[1] : `${eventBridgeName}-testing-queue`;

    this.sqsClient = new AWSClient.SQS();
    if (!this.keep) {
      console.info(
        "If running repeatedly add '--keep=true' to keep testing resources up to avoid creation throttles"
      );
    }

    const queueResult = await this.sqsClient
      .createQueue({
        QueueName: queueName,
      })
      .promise();

    this.QueueUrl = queueResult.QueueUrl;

    if (this.QueueUrl === undefined) {
      throw new Error("QueueUrl is undefined");
    }
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

  static async build(eventBridgeName: string): Promise<EventBridge> {
    const eventBridge = new EventBridge();
    await eventBridge.init(eventBridgeName);

    return eventBridge;
  }

  // eslint-disable-next-line max-params
  async publishEvent(
    source: string | undefined,
    detailType: string | undefined,
    detail: string | undefined,
    clear?: boolean
  ): Promise<PromiseResult<AWSEventBridge.PutEventsResponse, AWSError>> {
    if (this.eventBridgeClient === undefined) {
      throw new Error(
        "EventBridgeClient is undefined. You might have forgotten to use init()"
      );
    }
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

    if (clear === false) {
      return result;
    }
    await this.getEvents(); // need to clear this manual published event from the SQS observer queue.

    return result;
  }

  async getEvents(): Promise<SQS.ReceiveMessageResult | undefined> {
    if (this.QueueUrl === undefined) {
      throw new Error("QueueUrl is undefined");
    }
    // Long poll SQS queue
    const queueParams = {
      QueueUrl: this.QueueUrl,
      WaitTimeSeconds: 5,
    };
    if (this.sqsClient === undefined) {
      throw new Error(
        "SQSClient is undefined. You might have forgotten to use init()"
      );
    }
    const result = await this.sqsClient.receiveMessage(queueParams).promise();

    const messageHandlers = removeUndefinedMessages(
      result.Messages?.map((message: SQS.Message) => ({
        Id: message.MessageId,
        ReceiptHandle: message.ReceiptHandle,
      }))
    );

    if (messageHandlers !== undefined && messageHandlers.length > 0) {
      await this.sqsClient
        .deleteMessageBatch({
          Entries: messageHandlers,
          QueueUrl: this.QueueUrl,
        })
        .promise();
    }

    return result;
  }

  async clear(): Promise<any> {
    if (this.sqsClient === undefined) {
      throw new Error(
        "SQSClient is undefined. You might have forgotten to use init()"
      );
    }
    if (this.QueueUrl === undefined) {
      throw new Error("QueueUrl is undefined");
    }
    const result = await this.sqsClient
      .purgeQueue({
        QueueUrl: this.QueueUrl,
      })
      .promise();

    return result;
  }

  async destroy(): Promise<boolean> {
    if (this.keep === undefined) {
      throw new Error(
        "keep is undefined. You might have forgotten to use init()"
      );
    }
    if (!this.keep) {
      if (this.sqsClient === undefined) {
        throw new Error(
          "SQSClient is undefined. You might have forgotten to use init()"
        );
      }
      if (this.QueueUrl === undefined) {
        throw new Error("QueueUrl is undefined");
      }

      await this.sqsClient
        .deleteQueue({
          QueueUrl: this.QueueUrl,
        })
        .promise();

      if (this.eventBridgeClient === undefined) {
        throw new Error(
          "EventBridgeClient is undefined. You might have forgotten to use init()"
        );
      }

      if (this.targetId === undefined) {
        throw new Error(
          "targetId is undefined. You might have forgotten to use init()"
        );
      }
      if (this.ruleName === undefined) {
        throw new Error(
          "ruleName is undefined. You might have forgotten to use init()"
        );
      }
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
