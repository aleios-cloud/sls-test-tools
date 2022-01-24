import { testResult, TestResultOutput } from "utils/testResult";

export default {
  toHaveEventWithSource(
    { Messages }: { Messages: [{ Body: string }] },
    expectedSourceName: string
  ): TestResultOutput {
    let message;

    const parsedBody = JSON.parse(Messages[0].Body) as { source?: string };
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
