"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { useRealtime } from "@/hooks/useSocket";
import { getDashboardPath } from "@/lib/dashboardPath";
import { isChatRole } from "@/lib/enum";
import { UnreadDot } from "./NotificationBell";

// header shortcut to the inbox with the live unread count (chat roles only)
export function ChatInboxLink() {
  const { userId, role, chatUnread } = useRealtime();

  if (!userId || !isChatRole(role)) return null;

  return (
    <Link
      href={`${getDashboardPath(role)}/messages`}
      aria-label={chatUnread ? `Messages, ${chatUnread} unread` : "Messages"}
      title="Messages"
      className="relative inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <MessageCircle className="size-5" aria-hidden="true" />
      <UnreadDot count={chatUnread} />
    </Link>
  );
}
