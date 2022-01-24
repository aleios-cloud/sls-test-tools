type GlobalWithExpectKey = { expect: any };
export const isGlobalWithExpectKey = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  global: any
): global is GlobalWithExpectKey => "expect" in global;
