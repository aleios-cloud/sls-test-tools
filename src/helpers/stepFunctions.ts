import { StepFunctions as AWSStepFunctions } from "aws-sdk";

export default class StepFunctions {
  stepFunctions: AWSStepFunctions | undefined;
  allStateMachines: AWSStepFunctions.ListStateMachinesOutput | undefined;

  async init(): Promise<void> {
    this.stepFunctions = new AWSStepFunctions();
    this.allStateMachines = await this.stepFunctions
      .listStateMachines()
      .promise();
  }

  static async build(): Promise<StepFunctions> {
    const stepFunction = new StepFunctions();
    await stepFunction.init();

    return stepFunction;
  }

  async runExecution(stateMachineName: string, input: any): Promise<any> {
    // this.stepFunctions = new AWSStepFunctions();
    // this.allStateMachines = await this.stepFunctions
    //   .listStateMachines()
    //   .promise();
    if (this.allStateMachines === undefined) {
      throw new Error(
        "The list of state machines is undefined. You might have forgotten to run build()."
      );
    }

    const smList = this.allStateMachines.stateMachines.filter(
      (stateMachine: any) => stateMachine.name === stateMachineName
    );
    const stateMachineArn = smList[0].stateMachineArn;

    const executionParams = {
      stateMachineArn: stateMachineArn,
      input: JSON.stringify(input),
    };
    if (this.stepFunctions === undefined) {
      throw new Error(
        "The Step Functions client is undefined. You might have forgotten to run build()."
      );
    }
    const execution: AWSStepFunctions.StartExecutionOutput = await this.stepFunctions
      .startExecution(executionParams)
      .promise();
    const listExecParams = { stateMachineArn: stateMachineArn };
    const executionList = await this.stepFunctions
      .listExecutions(listExecParams)
      .promise();
    while (
      executionList.executions.filter(
        (exec: any) =>
          exec.executionArn === execution.executionArn &&
          exec.status === "RUNNING"
      ).length !== 0
    ) {
      continue;
    }

    return await this.stepFunctions
      .describeExecution({ executionArn: execution.executionArn })
      .promise();
  }
}
