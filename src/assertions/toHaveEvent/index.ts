import { SQS } from "aws-sdk";
import { testResult, TestResultOutput } from "utils/testResult";

export default {
  toHaveEvent(eventBridgeEvents?: SQS.ReceiveMessageResult): TestResultOutput {
    if (
      eventBridgeEvents === undefined ||
      eventBridgeEvents.Messages === undefined ||
      eventBridgeEvents.Messages.length === 0
    ) {
      return testResult("no message intercepted from EventBridge Bus", false);
    }

    return testResult("expected to have message in EventBridge Bus", true);
  },
};
