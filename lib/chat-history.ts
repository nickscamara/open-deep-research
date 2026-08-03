export function removeChatById<T extends { id: string }>(
  chats: T[] | undefined,
  chatId: string,
): T[] | undefined {
  return chats?.filter((chat) => chat.id !== chatId);
}
