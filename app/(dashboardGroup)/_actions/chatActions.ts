"use server";

import { baseApi } from "@/service/baseApi";
import {
  IChatUnread,
  IConversation,
  IConversationDetail,
  IMessage,
  TActionState,
  TApiResponse,
  TCursorMeta,
  TSearchParams,
} from "@/types";

/*
 * Chat reads are always fresh (no-store). Sending text normally goes over
 * the socket (hooks/useSocket); sendMessageAction is the REST fallback.
 */

const pickQuery = (query: TSearchParams | undefined, keys: string[]) =>
  Object.fromEntries(Object.entries(query ?? {}).filter(([key]) => keys.includes(key)));

const toActionState = <T>(result: TApiResponse<T>, successMessage?: string): TActionState<T> => ({
  success: result.success,
  message: result.success ? (successMessage ?? result.message) : result.message,
  statusCode: result.statusCode,
  data: result.data,
});

export const getMyConversationsAction = async ({ query }: { query?: TSearchParams } = {}) =>
  baseApi<IConversation[]>("/conversations", {
    query: { limit: "20", ...pickQuery(query, ["page", "side", "archived", "unread", "searchTerm"]) },
  });

export const getConversationByIdAction = async (conversationId: string) =>
  baseApi<IConversationDetail>(`/conversations/${encodeURIComponent(conversationId)}`);

export const getMessagesAction = async (
  conversationId: string,
  before?: string,
): Promise<TApiResponse<IMessage[]> & { cursor?: TCursorMeta | null }> => {
  const result = await baseApi<IMessage[]>(`/conversations/${encodeURIComponent(conversationId)}/messages`, {
    query: { limit: "30", before },
  });

  // messages use cursor meta, not page meta
  const { meta, ...rest } = result;

  return { ...rest, meta: null, cursor: (meta as unknown as TCursorMeta | null) ?? null };
};

export const getChatUnreadCountAction = async (): Promise<IChatUnread> => {
  const result = await baseApi<IChatUnread>("/conversations/unread-count");

  return result.success && result.data ? result.data : { total: 0, conversations: 0 };
};

export const startConversationAction = async (payload: {
  listingId: string;
  body?: string;
  quickReplyKey?: string;
  clientId?: string;
}) => {
  const result = await baseApi<{ created: boolean; conversation: IConversation; message: IMessage }>(
    "/conversations",
    { method: "POST", body: payload },
  );

  return toActionState(result, "Message sent");
};

export const sendMessageAction = async (
  conversationId: string,
  payload: { body?: string; quickReplyKey?: string; clientId?: string },
) =>
  toActionState(
    await baseApi<IMessage>(`/conversations/${encodeURIComponent(conversationId)}/messages`, {
      method: "POST",
      body: payload,
    }),
  );

// multipart: "images" files + "data" JSON with clientIds
export const sendImagesAction = async (conversationId: string, formData: FormData) =>
  toActionState(
    await baseApi<IMessage[]>(`/conversations/${encodeURIComponent(conversationId)}/images`, {
      method: "POST",
      formData,
    }),
  );

export const markConversationReadAction = async (conversationId: string) =>
  toActionState(
    await baseApi<{ conversationId: string; readAt: string }>(
      `/conversations/${encodeURIComponent(conversationId)}/read`,
      { method: "PATCH" },
    ),
  );

export const archiveConversationAction = async (conversationId: string, archived: boolean) =>
  toActionState(
    await baseApi<IConversation>(`/conversations/${encodeURIComponent(conversationId)}/archive`, {
      method: "PATCH",
      body: { archived },
    }),
    archived ? "Conversation archived" : "Moved back to your inbox",
  );
