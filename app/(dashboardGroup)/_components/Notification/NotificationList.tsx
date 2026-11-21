"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { NotificationIcon } from "@/components/notification/NotificationIcon";
import { useRealtime, useSocketEvent } from "@/hooks/useSocket";
import { formatChatTime } from "@/lib/formatChatTime";
import { cn } from "@/lib/utils";
import { INotification } from "@/types";
import {
  deleteNotificationAction,
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "../../_actions/notificationActions";

/*
 * Full notification list. Opening one marks it read and follows its link;
 * new notifications arrive live at the top (first page only).
 */
export function NotificationList({
  initialNotifications,
  isFirstPage,
  unreadOnly,
}: {
  initialNotifications: INotification[];
  isFirstPage: boolean;
  unreadOnly: boolean;
}) {
  const router = useRouter();
  const { notificationUnread, setNotificationUnread } = useRealtime();
  const [items, setItems] = useState(initialNotifications);

  const [source, setSource] = useState(initialNotifications);
  if (source !== initialNotifications) {
    setSource(initialNotifications);
    setItems(initialNotifications);
  }

  useSocketEvent<INotification>("notification:new", (notification) => {
    if (isFirstPage) setItems((current) => [notification, ...current]);
  });

  const now = () => new Date().toISOString();

  const open = (notification: INotification) => {
    if (!notification.readAt) {
      setItems((current) =>
        unreadOnly
          ? current.filter((item) => item.id !== notification.id)
          : current.map((item) => (item.id === notification.id ? { ...item, readAt: now() } : item)),
      );
      setNotificationUnread(Math.max(0, notificationUnread - 1));
      markNotificationReadAction(notification.id);
    }
    if (notification.link) router.push(notification.link);
  };

  const remove = async (notification: INotification) => {
    setItems((current) => current.filter((item) => item.id !== notification.id));
    const result = await deleteNotificationAction(notification.id);
    if (!result.success) {
      toast.error(result.message);
      router.refresh();
    }
  };

  const markAll = async () => {
    setItems((current) => (unreadOnly ? [] : current.map((item) => ({ ...item, readAt: item.readAt ?? now() }))));
    setNotificationUnread(0);
    const result = await markAllNotificationsReadAction();
    if (result.success) toast.success(result.message);
    else toast.error(result.message);
  };

  return (
    <div className="space-y-3">
      {notificationUnread > 0 && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={markAll}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-primary transition hover:bg-primary/10"
          >
            <CheckCheck className="size-4" aria-hidden="true" /> Mark all as read
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          {unreadOnly ? "No unread notifications." : "Nothing here yet."}
        </p>
      ) : (
        <ul className="divide-y overflow-hidden rounded-xl border bg-card">
          {items.map((notification) => (
            <li key={notification.id} className={cn("group flex items-start", !notification.readAt && "bg-primary/5")}>
              <button
                type="button"
                onClick={() => open(notification)}
                className="flex min-w-0 flex-1 gap-3 p-4 text-left transition hover:bg-muted/50 focus-visible:bg-muted focus-visible:outline-none"
              >
                <NotificationIcon type={notification.type} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-3">
                    <span className={cn("text-sm", !notification.readAt && "font-semibold")}>{notification.title}</span>
                    <time dateTime={notification.createdAt} className="shrink-0 text-xs text-muted-foreground">
                      {formatChatTime(notification.createdAt)}
                    </time>
                  </span>
                  {notification.body && (
                    <span className="mt-1 block text-sm text-muted-foreground">{notification.body}</span>
                  )}
                </span>
                {!notification.readAt && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
              </button>
              <button
                type="button"
                onClick={() => remove(notification)}
                className="m-3 inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 focus-visible:opacity-100"
                aria-label={`Remove notification: ${notification.title}`}
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
