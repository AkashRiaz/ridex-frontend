"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { getChatUnreadCountAction } from "@/app/(dashboardGroup)/_actions/chatActions";
import { getNotificationUnreadCountAction } from "@/app/(dashboardGroup)/_actions/notificationActions";
import { RealtimeContext } from "@/hooks/useSocket";
import { getDashboardPath } from "@/lib/dashboardPath";
import { isChatRole } from "@/lib/enum";
import { siteConfig } from "@/lib/siteConfig";
import { getSocketToken } from "@/service/getSocketToken";
import { IChatUnread, INotification, IUser, TMessageNewEvent } from "@/types";

/*
 * One Socket.io connection per signed-in tab, shared through context.
 * - handshake token comes from a server action (getSocketToken), fetched
 *   again on every reconnect, so the httpOnly access token stays server-side
 * - keeps the chat and notification badges live
 * - toasts new messages (except for the open thread) and new notifications
 */
export function RealtimeProvider({ user, children }: { user: IUser | null | undefined; children: ReactNode }) {
  const router = useRouter();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [chatUnread, setChatUnread] = useState(0);
  const [notificationUnread, setNotificationUnread] = useState(0);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  const userId = user?.id ?? null;
  const role = user?.role ?? null;
  const canChat = isChatRole(role);

  useEffect(() => {
    if (!userId || !siteConfig.socketUrl) return;

    let cancelled = false;

    const client = io(siteConfig.socketUrl, {
      // called before every connection attempt
      auth: (callback) => {
        getSocketToken()
          .then((token) => {
            if (!token) {
              client.disconnect();
              return;
            }
            callback({ token });
          })
          .catch(() => client.disconnect());
      },
      transports: ["websocket", "polling"],
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
    });

    const refreshCounts = () => {
      if (canChat) {
        getChatUnreadCountAction().then((counts) => !cancelled && setChatUnread(counts.total));
      }
      getNotificationUnreadCountAction().then((count) => !cancelled && setNotificationUnread(count));
    };

    client.on("connect", () => {
      // exposed once connected; listeners added through useSocketEvent survive reconnects
      setSocket(client);
      setConnected(true);
      // catch up on anything missed while offline
      refreshCounts();
    });
    client.on("disconnect", () => setConnected(false));
    client.on("auth:error", () => {
      client.disconnect();
      router.refresh();
    });

    client.on("chat:unread", (payload: IChatUnread) => setChatUnread(payload.total));
    client.on("notification:unread", (payload: { total: number }) => setNotificationUnread(payload.total));

    refreshCounts();

    return () => {
      cancelled = true;
      client.removeAllListeners();
      client.disconnect();
      setSocket(null);
      setConnected(false);
    };
  }, [userId, canChat, router]);

  // toasts (separate effect so the open thread id is always current)
  useEffect(() => {
    if (!socket || !userId) return;

    const dashboardPath = getDashboardPath(role) ?? "";

    const onMessage = ({ conversation, message }: TMessageNewEvent) => {
      if (!message.senderId || message.senderId === userId) return;
      if (conversation.id === activeConversationId && document.visibilityState === "visible") return;

      toast(conversation.counterpart.name, {
        id: `chat-${conversation.id}`,
        description: message.type === "IMAGE" ? "📷 Sent a photo" : message.body.slice(0, 120),
        action: {
          label: "Open",
          onClick: () => router.push(`${dashboardPath}/messages/${conversation.id}`),
        },
      });
    };

    const onNotification = (notification: INotification) => {
      toast(notification.title, {
        description: notification.body || undefined,
        ...(notification.link && {
          action: { label: "View", onClick: () => router.push(notification.link as string) },
        }),
      });
    };

    socket.on("message:new", onMessage);
    socket.on("notification:new", onNotification);

    return () => {
      socket.off("message:new", onMessage);
      socket.off("notification:new", onNotification);
    };
  }, [socket, userId, role, activeConversationId, router]);

  const value = useMemo(
    () => ({
      socket,
      connected,
      userId,
      role,
      chatUnread,
      notificationUnread,
      setChatUnread,
      setNotificationUnread,
      activeConversationId,
      setActiveConversationId,
    }),
    [socket, connected, userId, role, chatUnread, notificationUnread, activeConversationId],
  );

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}
