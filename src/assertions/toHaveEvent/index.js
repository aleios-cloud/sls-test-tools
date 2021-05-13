export default {
  toHaveEvent(eventBridgeEvents) {
    if (eventBridgeEvents) {
      return {
        message: () => "expected to have message in EventBridge Bus",
        pass: true,
      };
    }
    return {
      message: () => "no message intercepted from EventBridge Bus",
      pass: false,
    };
  },
};
