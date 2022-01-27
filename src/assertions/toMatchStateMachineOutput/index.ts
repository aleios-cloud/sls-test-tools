import * as AWS from "aws-sdk";
import { testResult, TestResultOutput } from "../../utils/testResult";
import StepFunctions from "../../helpers/stepFunctions";

export default {
  async toMatchStateMachineOutput(
    stateMachineName: string,
    expectedOutput: any
  ): Promise<TestResultOutput> {
    const stepFunctions = new AWS.StepFunctions();
    const allStateMachines = await stepFunctions.listStateMachines().promise();

    const smList = allStateMachines.stateMachines.filter(
      (stateMachine: any) => stateMachine.name === stateMachineName
    );
    const stateMachineArn = smList[0].stateMachineArn;
    
    const stepFunctionsObject =  await StepFunctions.build();
    const executionArn = await stepFunctionsObject.obtainExecutionArn(stateMachineArn); 

    const executionResult = await stepFunctions
      .describeExecution({
        executionArn: executionArn,
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
