// eslint-disable-next-line import/prefer-default-export
export const testResult = (message: string, pass: boolean) => ({
  message: () => message,
  pass,
});
