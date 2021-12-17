import toExistAsS3Bucket from "./toExistAsS3Bucket";
import toHaveContentEqualTo from "./toHaveContentEqualTo";
import toHaveContentTypeEqualTo from "./toHaveContentTypeEqualTo";
import toHaveEvent from "./toHaveEvent";
import toHaveEventWithSource from "./toHaveEventWithSource";
import toHaveObjectWithNameEqualTo from "./toHaveObjectWithNameEqualTo";

export default {
  ...toExistAsS3Bucket,
  ...toHaveContentEqualTo,
  ...toHaveContentTypeEqualTo,
  ...toHaveEvent,
  ...toHaveEventWithSource,
  ...toHaveObjectWithNameEqualTo,
};
