import { testResult } from "../../utils/testResult";

export default {
  toHaveEventWithSource(eventBridgeEvents, expectedSourceName) {
    let message;
    const hasMatchingSource = eventBridgeEvents.Messages.some(
      (event) => JSON.parse(event.Body).source === expectedSourceName
    );

    if (hasMatchingSource) {
      message = `expected sent event to have source ${expectedSourceName}`;
      return testResult(message, true);
    }
    message = `noSuchEvent: expected event with source matching "${expectedSourceName}"`;
    return testResult(message, false);
  },
};
