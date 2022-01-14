// eslint-disable-next-line import/prefer-default-export

export interface TestResultOutput {
  message: () => string;
  pass: boolean;
}

export const testResult = (
  message: string,
  pass: boolean
): TestResultOutput => ({
  message: () => message,
  pass,
});
