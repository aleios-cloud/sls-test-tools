type GlobalWithExpectKey = { expect: any };
export const isGlobalWithExpectKey = (
  global: any
): global is GlobalWithExpectKey => "expect" in global;
