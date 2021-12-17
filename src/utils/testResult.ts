// @ts-expect-error ts-migrate(7006) FIXME: Parameter 'message' implicitly has an 'any' type.
// eslint-disable-next-line import/prefer-default-export
export const testResult = (message, pass) => ({
  message: () => message,
  pass,
});
