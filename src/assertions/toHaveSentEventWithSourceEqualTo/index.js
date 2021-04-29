export default {
  toHaveSentEventWithSourceEqualTo(sqsResult, expectedSourceName) {
    const receivedSource = JSON.parse(sqsResult.Messages[0].Body).source;
    if (receivedSource == expectedSourceName) {
      return {
        message: () =>
          `expected sent event to have source ${expectedSourceName}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `sent event source "${receivedSource}" does not match expected source "${expectedSourceName}"`,
        pass: false,
      };
    }
  },
};
