import { testResult, TestResultOutput } from "utils/testResult";
import { SQS } from "aws-sdk";

export default {
  toHaveEventWithSource(
    Events: SQS.ReceiveMessageResult,
    expectedSourceName: string
  ): TestResultOutput {
    let message;

    if (Events.Messages === undefined || Events.Messages.length < 1) {
      return testResult("There are no events present.", false);
    }

    const parsedBody = JSON.parse(Events.Messages[0].Body) as {
      source?: string;
    };

    if (parsedBody.source === expectedSourceName) {
      message = `expected sent event to have source ${expectedSourceName}`;

      return testResult(message, true);
    }
    message = `sent event source "${
      parsedBody.source ?? "undefined"
    }" does not match expected source "${expectedSourceName}"`;

    return testResult(message, false);
  },
};
