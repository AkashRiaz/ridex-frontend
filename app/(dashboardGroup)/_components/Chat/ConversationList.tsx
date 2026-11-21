"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { useRealtime, useSocketEvent } from "@/hooks/useSocket";
import { formatChatTime } from "@/lib/formatChatTime";
import { cn } from "@/lib/utils";
import { IConversation, TConversationReadEvent, TMessageNewEvent, TTypingEvent } from "@/types";

export type TInboxFilter = {
  side?: "buying" | "selling";
  archived: boolean;
  unread: boolean;
  searchTerm?: string;
};

type ConversationListProps = {
  initialConversations: IConversation[];
  activeId?: string;
  dashboardPath: string;
  filter: TInboxFilter;
  // current query string, kept on thread links so the list stays filtered
  queryString: string;
};

const matchesFilter = (conversation: IConversation, filter: TInboxFilter) => {
  if (filter.archived !== conversation.isArchived) return false;
  if (filter.side === "buying" && conversation.side !== "buyer") return false;
  if (filter.side === "selling" && conversation.side !== "seller") return false;
  // a live search result list is not reordered or extended
  return !filter.searchTerm;
};

/*
 * Inbox rows, kept live: new messages move a thread to the top,
 * reading clears its badge, typing shows in the preview.
 */
export function ConversationList({
  initialConversations,
  activeId,
  dashboardPath,
  filter,
  queryString,
}: ConversationListProps) {
  const { userId } = useRealtime();
  const [conversations, setConversations] = useState(initialConversations);
  const [typingIds, setTypingIds] = useState<Set<string>>(new Set());
  const typingTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  // fresh server data (filter change, refresh) replaces the live copy
  const [source, setSource] = useState(initialConversations);
  if (source !== initialConversations) {
    setSource(initialConversations);
    setConversations(initialConversations);
  }

  useEffect(() => {
    const timers = typingTimers.current;
    return () => {
      for (const timer of timers.values()) clearTimeout(timer);
    };
  }, []);

  useSocketEvent<TMessageNewEvent>("message:new", ({ conversation }) => {
    setConversations((current) => {
      const others = current.filter((item) => item.id !== conversation.id);
      const exists = others.length !== current.length;

      if (!matchesFilter(conversation, filter)) {
        // e.g. a new message un-archived it: it leaves the archived list
        return exists && filter.archived !== conversation.isArchived ? others : current;
      }

      const next = conversation.id === activeId ? { ...conversation, unreadCount: 0 } : conversation;
      return [next, ...others];
    });

    setTypingIds((current) => {
      if (!current.has(conversation.id)) return current;
      const next = new Set(current);
      next.delete(conversation.id);
      return next;
    });
  });

  useSocketEvent<TConversationReadEvent>("conversation:read", (event) => {
    if (event.readerId !== userId) return;
    setConversations((current) =>
      current.map((item) => (item.id === event.conversationId ? { ...item, unreadCount: 0 } : item)),
    );
  });

  useSocketEvent<TTypingEvent>("typing", (event) => {
    if (event.userId === userId) return;

    clearTimeout(typingTimers.current.get(event.conversationId));
    setTypingIds((current) => {
      const next = new Set(current);
      if (event.isTyping) next.add(event.conversationId);
      else next.delete(event.conversationId);
      return next;
    });

    if (event.isTyping) {
      typingTimers.current.set(
        event.conversationId,
        setTimeout(() => {
          setTypingIds((current) => {
            const next = new Set(current);
            next.delete(event.conversationId);
            return next;
          });
        }, 6000),
      );
    }
  });

  if (conversations.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <MessageCircle className="size-6 text-muted-foreground" aria-hidden="true" />
        </div>
        <p className="mt-3 font-medium">
          {filter.searchTerm ? "No conversations match" : filter.archived ? "No archived conversations" : "No messages yet"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {filter.archived || filter.searchTerm
            ? "Try another filter."
            : "Ask a seller about a listing and the conversation shows up here."}
        </p>
        {!filter.archived && !filter.searchTerm && (
          <Link
            href="/listings"
            className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            Browse listings
          </Link>
        )}
      </div>
    );
  }

  return (
    <ul className="divide-y" aria-label="Conversations">
      {conversations.map((conversation) => {
        const isActive = conversation.id === activeId;
        const isUnread = conversation.unreadCount > 0 && !isActive;
        const isTyping = typingIds.has(conversation.id);

        return (
          <li key={conversation.id}>
            <Link
              href={`${dashboardPath}/messages/${conversation.id}${queryString ? `?${queryString}` : ""}`}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex gap-3 px-4 py-3 transition hover:bg-muted/60 focus-visible:bg-muted focus-visible:outline-none",
                isActive && "bg-primary/5",
              )}
            >
              <div className="relative">
                <UserAvatar name={conversation.counterpart.name} imageUrl={conversation.counterpart.imageUrl} size={44} />
                {conversation.counterpart.isOnline && (
                  <span
                    className="absolute right-0 bottom-0 size-3 rounded-full border-2 border-background bg-success"
                    aria-label="Online"
                  />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className={cn("truncate text-sm", isUnread ? "font-semibold" : "font-medium")}>
                    {conversation.counterpart.name}
                  </p>
                  <time
                    dateTime={conversation.lastMessageAt}
                    className={cn("shrink-0 text-[11px]", isUnread ? "font-semibold text-primary" : "text-muted-foreground")}
                  >
                    {formatChatTime(conversation.lastMessageAt)}
                  </time>
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  <span className="sr-only">{conversation.side === "buyer" ? "Buying: " : "Selling: "}</span>
                  {conversation.listing.title}
                </p>
                <div className="mt-0.5 flex items-center justify-between gap-2">
                  <p
                    className={cn(
                      "truncate text-sm",
                      isTyping ? "italic text-primary" : isUnread ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {isTyping
                      ? "typing…"
                      : `${conversation.lastMessageFromMe ? "You: " : ""}${conversation.lastMessagePreview}`}
                  </p>
                  {isUnread && (
                    <span
                      className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground"
                      aria-label={`${conversation.unreadCount} unread`}
                    >
                      {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
