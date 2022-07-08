import toExistAsS3Bucket from "./toExistAsS3Bucket";
import toHaveContentEqualTo from "./toHaveContentEqualTo";
import toHaveContentTypeEqualTo from "./toHaveContentTypeEqualTo";
import toHaveEvent from "./toHaveEvent";
import toHaveEventWithSource from "./toHaveEventWithSource";
import toHaveObjectWithNameEqualTo from "./toHaveObjectWithNameEqualTo";
import toExistInDynamoTable from "./toExistInDynamoTable";
import toHaveCompletedExecutionWithStatus from "./toHaveCompletedExecutionWithStatus";
import toContainItemWithValues from "./toContainItemWithValues";
import toMatchStateMachineOutput from "./toMatchStateMachineOutput";
import toContainUser from "./toContainUser";
import toContainUserWithAttributes from "./toContainUserWithAttributes";

export default {
  ...toExistAsS3Bucket,
  ...toHaveContentEqualTo,
  ...toHaveContentTypeEqualTo,
  ...toHaveEvent,
  ...toHaveEventWithSource,
  ...toHaveObjectWithNameEqualTo,
  ...toExistInDynamoTable,
  ...toHaveCompletedExecutionWithStatus,
  ...toContainItemWithValues,
  ...toMatchStateMachineOutput,
  ...toContainUser,
  ...toContainUserWithAttributes,
};
