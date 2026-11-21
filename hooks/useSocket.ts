"use client";

import { createContext, useContext, useEffect, useRef } from "react";
import type { Socket } from "socket.io-client";
import { Role } from "@/types";

export type TRealtimeContext = {
  socket: Socket | null;
  connected: boolean;
  userId: string | null;
  role: Role | null;
  chatUnread: number;
  notificationUnread: number;
  setChatUnread: (value: number) => void;
  setNotificationUnread: (value: number) => void;
  // the open thread: no "new message" toast for it
  activeConversationId: string | null;
  setActiveConversationId: (conversationId: string | null) => void;
};

const noop = () => undefined;

export const RealtimeContext = createContext<TRealtimeContext>({
  socket: null,
  connected: false,
  userId: null,
  role: null,
  chatUnread: 0,
  notificationUnread: 0,
  setChatUnread: noop,
  setNotificationUnread: noop,
  activeConversationId: null,
  setActiveConversationId: noop,
});

export const useRealtime = () => useContext(RealtimeContext);

/*
 * Subscribe to one server event for the component's lifetime.
 * The latest handler is always called (no stale closures), and the
 * listener survives reconnects because socket.io keeps listeners.
 */
export const useSocketEvent = <T>(event: string, handler: (payload: T) => void) => {
  const { socket } = useRealtime();
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    if (!socket) return;

    const listener = (payload: T) => handlerRef.current(payload);
    socket.on(event, listener);

    return () => {
      socket.off(event, listener);
    };
  }, [socket, event]);
};
