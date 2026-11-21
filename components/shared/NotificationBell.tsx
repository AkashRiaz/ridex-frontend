"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, Loader2, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationIcon } from "@/components/notification/NotificationIcon";
import {
  getMyNotificationsAction,
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/app/(dashboardGroup)/_actions/notificationActions";
import { useRealtime, useSocketEvent } from "@/hooks/useSocket";
import { getDashboardPath } from "@/lib/dashboardPath";
import { formatChatTime } from "@/lib/formatChatTime";
import { cn } from "@/lib/utils";
import { INotification } from "@/types";

const PREVIEW_LIMIT = 8;

export const UnreadDot = ({ count, className }: { count: number; className?: string }) =>
  count > 0 ? (
    <span
      className={cn(
        "absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-white",
        className,
      )}
      aria-hidden="true"
    >
      {count > 99 ? "99+" : count}
    </span>
  ) : null;

/*
 * Bell with a live unread count. The latest notifications load when the
 * menu opens; new ones arriving over the socket are prepended.
 */
export function NotificationBell() {
  const router = useRouter();
  const { userId, role, notificationUnread, setNotificationUnread } = useRealtime();
  const [items, setItems] = useState<INotification[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, startLoading] = useTransition();

  useSocketEvent<INotification>("notification:new", (notification) => {
    setItems((current) => (current ? [notification, ...current].slice(0, PREVIEW_LIMIT) : current));
  });

  if (!userId) return null;

  const dashboardPath = getDashboardPath(role) ?? "";

  const load = () => {
    startLoading(async () => {
      const result = await getMyNotificationsAction({ query: { limit: String(PREVIEW_LIMIT) } });

      if (result.success) {
        setItems(result.data ?? []);
        setError(null);
      } else {
        setError(result.message);
      }
    });
  };

  const open = (notification: INotification) => {
    if (!notification.readAt) {
      setItems((current) =>
        current?.map((item) => (item.id === notification.id ? { ...item, readAt: new Date().toISOString() } : item)) ??
        null,
      );
      setNotificationUnread(Math.max(0, notificationUnread - 1));
      markNotificationReadAction(notification.id);
    }

    if (notification.link) router.push(notification.link);
  };

  const markAll = async () => {
    setItems((current) => current?.map((item) => ({ ...item, readAt: item.readAt ?? new Date().toISOString() })) ?? null);
    setNotificationUnread(0);
    await markAllNotificationsReadAction();
  };

  const label = notificationUnread ? `Notifications, ${notificationUnread} unread` : "Notifications";

  return (
    <DropdownMenu onOpenChange={(isOpen) => isOpen && load()}>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label={label}
            title="Notifications"
            className="relative inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        }
      >
        <Bell className="size-5" aria-hidden="true" />
        <UnreadDot count={notificationUnread} />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[min(22rem,calc(100vw-2rem))] p-0">
        <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
          <p className="text-sm font-semibold">Notifications</p>
          <div className="flex items-center gap-1">
            {notificationUnread > 0 && (
              <button
                type="button"
                onClick={markAll}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-primary transition hover:bg-primary/10"
              >
                <CheckCheck className="size-3.5" aria-hidden="true" /> Mark all read
              </button>
            )}
            <Link
              href={`${dashboardPath}/notifications/settings`}
              aria-label="Notification settings"
              title="Notification settings"
              className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted"
            >
              <Settings className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {isLoading && !items ? (
            <div className="flex items-center justify-center gap-2 p-8 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Loading…
            </div>
          ) : error ? (
            <p className="p-6 text-center text-sm text-destructive">{error}</p>
          ) : !items?.length ? (
            <div className="p-8 text-center">
              <Bell className="mx-auto size-8 text-muted-foreground/50" aria-hidden="true" />
              <p className="mt-2 text-sm font-medium">You&apos;re all caught up</p>
              <p className="text-xs text-muted-foreground">Updates about your listings and account appear here.</p>
            </div>
          ) : (
            <ul className="divide-y">
              {items.map((notification) => (
                <li key={notification.id}>
                  <button
                    type="button"
                    onClick={() => open(notification)}
                    className={cn(
                      "flex w-full gap-3 px-4 py-3 text-left transition hover:bg-muted/60 focus-visible:bg-muted focus-visible:outline-none",
                      !notification.readAt && "bg-primary/5",
                    )}
                  >
                    <NotificationIcon type={notification.type} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-2">
                        <span className={cn("text-sm", !notification.readAt && "font-semibold")}>
                          {notification.title}
                        </span>
                        <span className="shrink-0 text-[11px] text-muted-foreground">
                          {formatChatTime(notification.createdAt)}
                        </span>
                      </span>
                      {notification.body && (
                        <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">{notification.body}</span>
                      )}
                    </span>
                    {!notification.readAt && (
                      <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t p-2">
          <Link
            href={`${dashboardPath}/notifications`}
            className="block rounded-md px-3 py-2 text-center text-sm font-medium text-primary transition hover:bg-primary/10"
          >
            View all notifications
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
