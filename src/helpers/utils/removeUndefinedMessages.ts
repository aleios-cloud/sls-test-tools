interface MessageHandler {
  Id: string | undefined;
  ReceiptHandle: string | undefined;
}
interface DefinedMessageHandler {
  Id: string;
  ReceiptHandle: string;
}

export const removeUndefinedMessages = (
  messageHandlers: MessageHandler[] | undefined
): DefinedMessageHandler[] | undefined =>
  messageHandlers?.filter(
    (messageHandler): messageHandler is DefinedMessageHandler =>
      messageHandler.Id !== undefined &&
      messageHandler.ReceiptHandle !== undefined
  );
