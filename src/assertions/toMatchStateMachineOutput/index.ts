import { testResult, TestResultOutput } from "../../utils/testResult";
import { StepFunctions as AWSStepFunctions } from "aws-sdk";
import StepFunctions from "../../helpers/stepFunctions";

export default {
  async toMatchStateMachineOutput(
    stateMachineName: string,
    expectedOutput: any
  ): Promise<TestResultOutput> {
    const stepFunctions = new AWSStepFunctions();
    const stepFunctionObject = await StepFunctions.build();
    // Helper to get stateMachine ARN from stateMachine name
    const smArn = await stepFunctionObject.obtainStateMachineArn(
      stateMachineName
    );
    // Helper to get latest execution ARN for given stateMachine
    const exArn = await stepFunctionObject.obtainExecutionArn(smArn);

    const executionResult = await stepFunctions
      .describeExecution({
        executionArn: exArn,
      })
      .promise();

    if (executionResult.status === "SUCCEEDED") {
      if (executionResult.output === expectedOutput) {
        return testResult(
          `Output is ${JSON.stringify(executionResult.output)} as expected`,
          true
        );
      } else {
        return testResult(
          `Expected output was ${JSON.stringify(
            expectedOutput
          )}, but output received was ${JSON.stringify(
            executionResult.output
          )}`,
          false
        );
      }
    }

    return testResult(
      "Step Function execution failed. Cannot verify output for failed executions.",
      false
    );
  },
};
