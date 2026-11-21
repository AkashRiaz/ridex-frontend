"use server";

import { baseApi } from "@/service/baseApi";
import { IQuickReplies, TActionState } from "@/types";

type TCustomReply = IQuickReplies["custom"][number];

export const getQuickRepliesAction = async () => baseApi<IQuickReplies>("/quick-replies");

export const createQuickReplyAction = async (text: string): Promise<TActionState<TCustomReply>> => {
  const result = await baseApi<TCustomReply>("/quick-replies", { method: "POST", body: { text } });

  return {
    success: result.success,
    message: result.success ? "Quick reply saved" : result.message,
    statusCode: result.statusCode,
    data: result.data,
  };
};

export const deleteQuickReplyAction = async (id: string): Promise<TActionState> => {
  const result = await baseApi(`/quick-replies/${encodeURIComponent(id)}`, { method: "DELETE" });

  return {
    success: result.success,
    message: result.success ? "Quick reply deleted" : result.message,
    statusCode: result.statusCode,
  };
};
