import { testResult, TestResultOutput } from "../../utils/testResult";

const AWS = require("aws-sdk");

export default {
  async toHaveCompletedExecutionWithStatus(
    stateMachineName: string,
    expectedStatus: string
  ): Promise<TestResultOutput> {
    const stepFunctions = new AWS.StepFunctions();
    const listStateMachineParams = {};
    // Get all state machines
    const allStateMachines = await stepFunctions
      .listStateMachines(listStateMachineParams)
      .promise();
    // Find state machine with specified name and get its arn
    const smList = allStateMachines.stateMachines.filter(
      (stateMachine: any) => stateMachine.name === stateMachineName
    );
    const smArn = smList[0].stateMachineArn;
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
