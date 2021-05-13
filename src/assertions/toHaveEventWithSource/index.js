export default {
  toHaveEventWithSource(eventBridgeEvents, expectedSourceName) {
    const receivedSource = JSON.parse(eventBridgeEvents.Messages[0].Body)
      .source;
    if (receivedSource === expectedSourceName) {
      return {
        message: () =>
          `expected sent event to have source ${expectedSourceName}`,
        pass: true,
      };
    }
    return {
      message: () =>
        `sent event source "${receivedSource}" does not match expected source "${expectedSourceName}"`,
      pass: false,
    };
  },
};
