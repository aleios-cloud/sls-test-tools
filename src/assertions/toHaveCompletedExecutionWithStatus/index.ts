import { testResult, TestResultOutput } from "../../utils/testResult";
import StepFunctions from "../../helpers/stepFunctions";

import * as AWS from "aws-sdk";

export default {
  async toHaveCompletedExecutionWithStatus(
    stateMachineName: string,
    expectedStatus: string
  ): Promise<TestResultOutput> {
    const stepFunctions = new AWS.StepFunctions();
    const stepFunctionsObject =  await StepFunctions.build();
    // Helper to get stateMachine ARN from stateMachine name
    const smArn = await stepFunctionsObject.obtainStateMachineArn(stateMachineName); 
    
    const listExecutionsParams = { stateMachineArn: smArn };
    // Get all executions of specified state machine
    const smExecutions = await stepFunctions
      .listExecutions(listExecutionsParams)
      .promise();
    // Get the latest execution (list ordered in reverse chronological)
    const latestExecution = smExecutions.executions[0];
    if (latestExecution.status === expectedStatus) {
      return testResult(
        `Execution status is ${expectedStatus}, as expected.`,
        true
      );
    }

    return testResult(
      `Execution status was ${latestExecution.status}, where it was expected to be ${expectedStatus}`,
      false
    );
  },
};
