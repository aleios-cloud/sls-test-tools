import { testResult } from "../../utils/testResult";

export default {
  toHaveEvent(eventBridgeEvents) {
    let message;
    if (eventBridgeEvents) {
      message = "expected to have message in EventBridge Bus";
      return testResult(message, true);
    }
    message = "no message intercepted from EventBridge Bus";
    return testResult(message, false);
  },
};
