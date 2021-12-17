import { testResult } from "../../utils/testResult";

export default {
  toHaveEventWithSource(eventBridgeEvents, expectedSourceName) {
    let message;
    const receivedSource = JSON.parse(eventBridgeEvents.Messages[0].Body)
      .source;
    if (receivedSource === expectedSourceName) {
      message = `expected sent event to have source ${expectedSourceName}`;
      return testResult(message, true);
    }
    message = `sent event source "${receivedSource}" does not match expected source "${expectedSourceName}"`;
    return testResult(message, false);
  },
};
