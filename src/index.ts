import matchers from "./assertions";
import { isGlobalWithExpectKey } from "./assertions/utils/globalTypeChecker";

if (isGlobalWithExpectKey(global)) {
  const jestExpect = global.expect;

  if (jestExpect !== undefined) {
    jestExpect.extend(matchers);
  } else {
    console.error("Unable to find Jest's global expect.");
  }
}

export * from "./helpers";
