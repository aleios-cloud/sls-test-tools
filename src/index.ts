/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
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

declare global {
  namespace jest {
    interface Matchers<R> {
      toExistAsS3Bucket(): Promise<R>;
      toExistInDynamoTable(table: string): Promise<R>;
      toHaveContentEqualTo(
        content: Record<string, unknown> | string
      ): Promise<R>;
      toHaveContentTypeEqualTo(contentType: string): Promise<R>;
      toHaveEvent(): R;
      toHaveEventWithSource(expectedSourceName: string): R;
      toHaveS3ObjectWithNameEqualTo(objectName: string): Promise<R>;
      toContainItemWithValues(values:{ [key: string]: unknown }): Promise<R>;
    }
  }
}
