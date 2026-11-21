"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, LucideIcon, MessageCircle, Plus, Search, User } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useRealtime } from "@/hooks/useSocket";
import { getDashboardPath } from "@/lib/dashboardPath";
import { isChatRole } from "@/lib/enum";
import { getSellHref, isActiveNavHref } from "@/lib/navigation";
import { NavbarProps } from "@/lib/type";
import { cn } from "@/lib/utils";

type TTab = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
  // the raised centre button
  primary?: boolean;
  // highlight rule (defaults to the href)
  activeWhen?: (pathname: string) => boolean;
};

const formatBadge = (count: number) => (count > 99 ? "99+" : String(count));

/*
 * Bottom tab bar for phones and small tablets (hidden from lg up).
 * The public layout adds matching bottom padding (pb-bottom-nav) so nothing is covered.
 */
export function MobileBottomNav({ user }: NavbarProps) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const { chatUnread } = useRealtime();

  const role = user?.success ? user.data?.role : undefined;
  const dashboardPath = getDashboardPath(role);
  const sellHref = getSellHref(role);

  const tabs: TTab[] = [
    { label: "Home", href: "/", icon: House },
    { label: "Search", href: "/listings", icon: Search },
    ...(sellHref ? [{ label: "Sell", href: sellHref, icon: Plus, primary: true }] : []),
    // visitors are sent to log in; staff roles have no chat inbox, so no tab
    ...(isChatRole(role) && dashboardPath
      ? [{ label: "Chats", href: `${dashboardPath}/messages`, icon: MessageCircle, badge: chatUnread }]
      : role
        ? []
        : [{ label: "Chats", href: "/login", icon: MessageCircle, activeWhen: () => false }]),
    dashboardPath
      ? { label: "Account", href: dashboardPath, icon: User }
      : { label: "Log in", href: "/login", icon: User },
  ];

  return (
    <nav
      aria-label="Quick navigation"
      className="glass fixed inset-x-0 bottom-0 z-40 border-t pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="mx-auto flex h-(--bottom-nav-height) max-w-lg items-stretch justify-around px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = tab.activeWhen ? tab.activeWhen(pathname) : isActiveNavHref(pathname, tab.href);
          const label = tab.badge ? `${tab.label}, ${tab.badge} unread` : tab.label;

          if (tab.primary) {
            return (
              <li key={tab.label} className="flex flex-1 justify-center">
                <Link
                  href={tab.href}
                  aria-label={label}
                  className="-mt-5 flex flex-col items-center gap-1 text-[11px] font-medium text-foreground"
                >
                  <span className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-elevated ring-4 ring-background transition active:scale-90">
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  {tab.label}
                </Link>
              </li>
            );
          }

          return (
            <li key={tab.label} className="flex flex-1">
              <Link
                href={tab.href}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors active:scale-95",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="bottom-nav-indicator"
                    aria-hidden="true"
                    className="absolute inset-x-5 top-0 h-0.5 rounded-full bg-primary"
                    transition={reduceMotion ? { duration: 0 } : { type: "spring", bounce: 0.25, duration: 0.45 }}
                  />
                )}
                <span className="relative">
                  <Icon className="size-5" aria-hidden="true" />
                  {Boolean(tab.badge) && (
                    <span
                      aria-hidden="true"
                      className="absolute -right-2.5 -top-1.5 min-w-4 rounded-full bg-destructive px-1 text-center text-[10px] font-semibold leading-4 text-white"
                    >
                      {formatBadge(tab.badge ?? 0)}
                    </span>
                  )}
                </span>
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
