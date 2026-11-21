"use client";

import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ban, Info, Loader2, Lock, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { compressImage } from "@/lib/compressImage";
import { formatDayLabel, isSameDay } from "@/lib/formatChatTime";
import { useRealtime, useSocketEvent } from "@/hooks/useSocket";
import {
  IChatMessage,
  IConversationDetail,
  IMessage,
  TBlockChangedEvent,
  TConversationReadEvent,
  TCursorMeta,
  TMessageNewEvent,
  TSocketAck,
  TTypingEvent,
} from "@/types";
import {
  getMessagesAction,
  markConversationReadAction,
  sendImagesAction,
  sendMessageAction,
} from "../../_actions/chatActions";
import { setUserBlockedAction } from "../../_actions/userBlockActions";
import { ChatHeader } from "./ChatHeader";
import { MessageBubble, TypingIndicator } from "./MessageBubble";
import { MessageComposer } from "./MessageComposer";

type ChatThreadProps = {
  conversation: IConversationDetail;
  initialMessages: IMessage[];
  initialCursor: TCursorMeta | null;
  meId: string;
  dashboardPath: string;
};

type TTextPayload = { text: string; body?: string; quickReplyKey?: string };

const SEND_TIMEOUT_MS = 10_000;
const TYPING_EMIT_EVERY_MS = 2500;
const TYPING_IDLE_MS = 3000;
const TYPING_SHOW_MS = 6000;
const NEAR_EDGE_PX = 120;

/*
 * Adds a confirmed message: replaces its optimistic copy (same clientId),
 * ignores duplicates (socket echo + ack), keeps the list in time order.
 */
const mergeMessage = (list: IChatMessage[], message: IMessage): IChatMessage[] => {
  const withoutPending = message.clientId
    ? list.filter((item) => !(item.clientId === message.clientId && item.id !== message.id))
    : list;

  if (withoutPending.some((item) => item.id === message.id)) return withoutPending;

  const next = [...withoutPending, message];

  return next.sort((first, second) => new Date(first.createdAt).getTime() - new Date(second.createdAt).getTime());
};

const updateByClientId = (list: IChatMessage[], clientId: string, patch: Partial<IChatMessage>) =>
  list.map((item) => (item.clientId === clientId && item.id.startsWith("local-") ? { ...item, ...patch } : item));

export function ChatThread({ conversation, initialMessages, initialCursor, meId, dashboardPath }: ChatThreadProps) {
  const router = useRouter();
  const { socket, setActiveConversationId } = useRealtime();
  const conversationId = conversation.id;

  const [messages, setMessages] = useState<IChatMessage[]>(initialMessages);
  const [cursor, setCursor] = useState<TCursorMeta | null>(initialCursor);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [counterpartLastReadAt, setCounterpartLastReadAt] = useState(conversation.counterpartLastReadAt);
  const [isTyping, setIsTyping] = useState(false);
  const [isUnblocking, startUnblocking] = useTransition();

  // the "new messages" divider is placed once, where unread started
  const [firstUnreadId] = useState(
    () =>
      initialMessages.find(
        (message) =>
          message.senderId &&
          message.senderId !== meId &&
          (!conversation.myLastReadAt || new Date(message.createdAt) > new Date(conversation.myLastReadAt)),
      )?.id ?? null,
  );

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const atBottomRef = useRef(true);
  const prependHeightRef = useRef<number | null>(null);
  const initialScrollDoneRef = useRef(false);
  const hasUnreadRef = useRef(conversation.unreadCount > 0);
  const filesRef = useRef(new Map<string, File>());
  const typingTimers = useRef<{ idle?: ReturnType<typeof setTimeout>; show?: ReturnType<typeof setTimeout>; lastEmit: number }>({
    lastEmit: 0,
  });

  // ============================================
  // Read receipts
  // ============================================

  const markRead = useCallback(() => {
    if (document.visibilityState !== "visible" || !hasUnreadRef.current) return;
    hasUnreadRef.current = false;

    if (socket?.connected) {
      socket.emit("conversation:read", { conversationId });
    } else {
      markConversationReadAction(conversationId);
    }
  }, [socket, conversationId]);

  useEffect(() => {
    setActiveConversationId(conversationId);
    return () => setActiveConversationId(null);
  }, [conversationId, setActiveConversationId]);

  useEffect(() => {
    markRead();

    const onVisible = () => markRead();
    document.addEventListener("visibilitychange", onVisible);

    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [markRead]);

  // ============================================
  // Live events
  // ============================================

  useSocketEvent<TMessageNewEvent>("message:new", ({ message }) => {
    if (message.conversationId !== conversationId) return;

    setMessages((current) => mergeMessage(current, message));

    if (message.type === "SYSTEM") {
      // e.g. "marked as sold": refresh the listing banner
      router.refresh();
      return;
    }

    if (message.senderId !== meId) {
      setIsTyping(false);
      hasUnreadRef.current = true;
      markRead();
    }
  });

  useSocketEvent<TConversationReadEvent>("conversation:read", (event) => {
    if (event.conversationId === conversationId && event.readerId !== meId) {
      setCounterpartLastReadAt(event.readAt);
    }
  });

  useSocketEvent<TTypingEvent>("typing", (event) => {
    if (event.conversationId !== conversationId || event.userId === meId) return;

    setIsTyping(event.isTyping);
    clearTimeout(typingTimers.current.show);
    if (event.isTyping) {
      typingTimers.current.show = setTimeout(() => setIsTyping(false), TYPING_SHOW_MS);
    }
  });

  useSocketEvent<TBlockChangedEvent>("block:changed", (event) => {
    if (event.userId === conversation.counterpart.id) router.refresh();
  });

  useEffect(() => {
    const timers = typingTimers.current;
    return () => {
      clearTimeout(timers.idle);
      clearTimeout(timers.show);
    };
  }, []);

  // ============================================
  // Scrolling
  // ============================================

  const scrollToBottom = (behavior: ScrollBehavior = "auto") => {
    const element = scrollRef.current;
    if (element) element.scrollTo({ top: element.scrollHeight, behavior });
  };

  useLayoutEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    if (!initialScrollDoneRef.current) {
      initialScrollDoneRef.current = true;
      const divider = firstUnreadId ? element.querySelector<HTMLElement>("[data-unread-divider]") : null;
      if (divider) element.scrollTop = Math.max(0, divider.offsetTop - 80);
      else element.scrollTop = element.scrollHeight;
      return;
    }

    if (prependHeightRef.current !== null) {
      // keep the reader's place after older messages are added on top
      element.scrollTop += element.scrollHeight - prependHeightRef.current;
      prependHeightRef.current = null;
      return;
    }

    const last = messages[messages.length - 1];
    if (atBottomRef.current || last?.senderId === meId) scrollToBottom("smooth");
  }, [messages, isTyping, firstUnreadId, meId]);

  const loadOlder = async () => {
    if (!cursor?.hasMore || !cursor.nextCursor || loadingOlder) return;

    setLoadingOlder(true);
    const result = await getMessagesAction(conversationId, cursor.nextCursor);
    setLoadingOlder(false);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    prependHeightRef.current = scrollRef.current?.scrollHeight ?? null;
    setMessages((current) => {
      const known = new Set(current.map((message) => message.id));
      return [...(result.data ?? []).filter((message) => !known.has(message.id)), ...current];
    });
    setCursor(result.cursor ?? null);
  };

  const handleScroll = () => {
    const element = scrollRef.current;
    if (!element) return;

    atBottomRef.current = element.scrollHeight - element.scrollTop - element.clientHeight < NEAR_EDGE_PX;
    if (element.scrollTop < NEAR_EDGE_PX) loadOlder();
  };

  // ============================================
  // Typing
  // ============================================

  const stopTyping = useCallback(() => {
    clearTimeout(typingTimers.current.idle);
    if (typingTimers.current.lastEmit) {
      socket?.emit("typing:stop", { conversationId });
      typingTimers.current.lastEmit = 0;
    }
  }, [socket, conversationId]);

  const handleTyping = () => {
    const now = Date.now();
    if (now - typingTimers.current.lastEmit > TYPING_EMIT_EVERY_MS) {
      socket?.emit("typing:start", { conversationId });
      typingTimers.current.lastEmit = now;
    }
    clearTimeout(typingTimers.current.idle);
    typingTimers.current.idle = setTimeout(stopTyping, TYPING_IDLE_MS);
  };

  // ============================================
  // Sending
  // ============================================

  const deliverText = async (clientId: string, payload: TTextPayload) => {
    const request = { body: payload.body, quickReplyKey: payload.quickReplyKey, clientId };

    const result: TSocketAck<IMessage> = socket?.connected
      ? await new Promise((resolve) => {
          socket
            .timeout(SEND_TIMEOUT_MS)
            .emit("message:send", { conversationId, ...request }, (error: Error | null, ack: TSocketAck<IMessage>) =>
              resolve(error ? { success: false, message: "Message not sent. Check your connection." } : ack),
            );
        })
      : await sendMessageAction(conversationId, request).then((state) => ({
          success: state.success,
          message: state.message,
          data: state.data ?? undefined,
        }));

    if (result.success && result.data) {
      const confirmed = result.data;
      setMessages((current) => mergeMessage(current, confirmed));
    } else {
      setMessages((current) => updateByClientId(current, clientId, { pending: false, failed: true }));
      toast.error(result.message || "Message not sent");
    }
  };

  const sendText = (payload: TTextPayload) => {
    const clientId = crypto.randomUUID();

    setMessages((current) => [
      ...current,
      {
        id: `local-${clientId}`,
        conversationId,
        senderId: meId,
        type: "TEXT",
        body: payload.text,
        imageUrl: null,
        quickReplyKey: payload.quickReplyKey ?? null,
        clientId,
        createdAt: new Date().toISOString(),
        pending: true,
      },
    ]);
    stopTyping();
    deliverText(clientId, payload);
  };

  const deliverImages = async (entries: { clientId: string; file: File }[]) => {
    const formData = new FormData();

    for (const { file } of entries) {
      formData.append("images", await compressImage(file));
    }
    formData.append("data", JSON.stringify({ clientIds: entries.map((entry) => entry.clientId) }));

    const result = await sendImagesAction(conversationId, formData);

    if (result.success && result.data) {
      const sent = result.data;
      setMessages((current) => sent.reduce((list, message) => mergeMessage(list, message), current));
      for (const { clientId } of entries) filesRef.current.delete(clientId);
    } else {
      setMessages((current) =>
        entries.reduce((list, entry) => updateByClientId(list, entry.clientId, { pending: false, failed: true }), current),
      );
      toast.error(result.message || "Photos not sent");
    }
  };

  const sendImages = (files: File[]) => {
    const entries = files.map((file) => ({ clientId: crypto.randomUUID(), file }));

    setMessages((current) => [
      ...current,
      ...entries.map(({ clientId, file }) => {
        filesRef.current.set(clientId, file);
        return {
          id: `local-${clientId}`,
          conversationId,
          senderId: meId,
          type: "IMAGE" as const,
          body: "",
          imageUrl: null,
          localImageUrl: URL.createObjectURL(file),
          quickReplyKey: null,
          clientId,
          createdAt: new Date().toISOString(),
          pending: true,
        };
      }),
    ]);
    deliverImages(entries);
  };

  const retry = (message: IChatMessage) => {
    if (!message.clientId) return;
    const clientId = message.clientId;

    setMessages((current) => updateByClientId(current, clientId, { pending: true, failed: false }));

    if (message.type === "IMAGE") {
      const file = filesRef.current.get(clientId);
      if (file) deliverImages([{ clientId, file }]);
      return;
    }

    deliverText(clientId, {
      text: message.body,
      ...(message.quickReplyKey ? { quickReplyKey: message.quickReplyKey } : { body: message.body }),
    });
  };

  // local photo previews are released when the thread unmounts
  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  });
  useEffect(
    () => () => {
      for (const message of messagesRef.current) {
        if (message.localImageUrl) URL.revokeObjectURL(message.localImageUrl);
      }
    },
    [],
  );

  const unblock = () =>
    startUnblocking(async () => {
      const result = await setUserBlockedAction(conversation.counterpart.id, false);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });

  // ============================================
  // Render
  // ============================================

  const seenAt = counterpartLastReadAt ? new Date(counterpartLastReadAt).getTime() : 0;

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
      <ChatHeader conversation={conversation} dashboardPath={dashboardPath} isTyping={isTyping} />

      {conversation.listingNotice && conversation.canReply && (
        <p className="flex shrink-0 items-center gap-2 border-b bg-amber-500/10 px-4 py-2 text-xs text-amber-700 dark:text-amber-300">
          <Info className="size-3.5 shrink-0" aria-hidden="true" /> {conversation.listingNotice}
        </p>
      )}

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-5"
        role="log"
        aria-label={`Conversation with ${conversation.counterpart.name}`}
        aria-live="polite"
      >
        {cursor?.hasMore && (
          <div className="mb-3 flex justify-center">
            <button
              type="button"
              onClick={loadOlder}
              disabled={loadingOlder}
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs text-muted-foreground transition hover:bg-muted"
            >
              {loadingOlder && <Loader2 className="size-3 animate-spin" aria-hidden="true" />}
              Load earlier messages
            </button>
          </div>
        )}

        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center text-sm text-muted-foreground">
            <MessageCircle className="mb-2 size-8 opacity-50" aria-hidden="true" />
            No messages yet. Say hello!
          </div>
        )}

        {messages.map((message, index) => {
          const previous = messages[index - 1];
          const showDay = !previous || !isSameDay(previous.createdAt, message.createdAt);
          const mine = message.senderId === meId;

          return (
            <Fragment key={message.clientId ?? message.id}>
              {showDay && (
                <div className="my-4 flex justify-center">
                  <span className="rounded-full bg-background px-3 py-0.5 text-[11px] font-medium text-muted-foreground shadow-xs ring-1 ring-border">
                    {formatDayLabel(message.createdAt)}
                  </span>
                </div>
              )}
              {message.id === firstUnreadId && (
                <div data-unread-divider className="my-3 flex items-center gap-3 text-[11px] font-medium text-primary">
                  <span className="h-px flex-1 bg-primary/30" />
                  New messages
                  <span className="h-px flex-1 bg-primary/30" />
                </div>
              )}
              <MessageBubble
                message={message}
                mine={mine}
                seen={mine && seenAt >= new Date(message.createdAt).getTime()}
                startsGroup={showDay || previous?.senderId !== message.senderId}
                onRetry={retry}
              />
            </Fragment>
          );
        })}

        {isTyping && <TypingIndicator name={conversation.counterpart.name} />}
      </div>

      {conversation.canReply ? (
        <MessageComposer
          side={conversation.side}
          onSendText={sendText}
          onSendImages={sendImages}
          onTyping={handleTyping}
          onStopTyping={stopTyping}
        />
      ) : (
        <div className="flex shrink-0 flex-wrap items-center justify-center gap-3 border-t bg-muted/40 px-4 py-4 text-center text-sm text-muted-foreground">
          {conversation.readOnlyCode === "BLOCKED_BY_ME" ? (
            <Ban className="size-4" aria-hidden="true" />
          ) : (
            <Lock className="size-4" aria-hidden="true" />
          )}
          <span>{conversation.readOnlyReason}</span>
          {conversation.readOnlyCode === "BLOCKED_BY_ME" && (
            <button
              type="button"
              onClick={unblock}
              disabled={isUnblocking}
              className="rounded-md border px-3 py-1 text-xs font-medium text-foreground transition hover:bg-background"
            >
              {isUnblocking ? "Unblocking…" : "Unblock"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
