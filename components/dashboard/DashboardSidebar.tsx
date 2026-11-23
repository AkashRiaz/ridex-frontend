"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

import { ISidebarGroup, NavbarProps, TSidebarBadge } from "@/lib/type";
import { getDashboardPath, isRole } from "@/lib/dashboardPath";
import { siteConfig } from "@/lib/siteConfig";
import { Bike } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { roleRoutes } from "../routes";
import { useRealtime } from "@/hooks/useSocket";
import { useQueueCounts } from "@/hooks/useQueueCounts";

export default function DashboardSidebar({ user }: NavbarProps) {
  const pathname = usePathname();

  const { isMobile, setOpenMobile } = useSidebar();

  const { chatUnread, notificationUnread } = useRealtime();

  const role = user?.data?.role;

  // staff only: pending listings, open reports, pending verifications
  const queueCounts = useQueueCounts(isRole(role) ? role : null);

  const badgeCount = (badge?: TSidebarBadge) => {
    switch (badge) {
      case "chat":
        return chatUnread;
      case "notifications":
        return notificationUnread;
      case "listings":
      case "reports":
        return queueCounts?.[badge] ?? 0;
      case "verifications":
        return queueCounts?.verifications ?? 0;
      case "loanLeads":
        return queueCounts?.loanLeads ?? 0;
      default:
        return 0;
    }
  };

  const badgeLabel = (badge: TSidebarBadge | undefined, count: number) =>
    badge === "chat" || badge === "notifications" ? `${count} unread` : `${count} waiting`;

  const navItems: ISidebarGroup[] = isRole(role) ? roleRoutes[role] : [];

  const dashboardHomePath = getDashboardPath(role) ?? "/";

  const isItemActive = (href: string) => {
    if (href === "#" || !href) return false;

    if (href === dashboardHomePath) {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleNavigation = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar collapsible="offcanvas" className="border-r border-sidebar-border">
      {/* Sidebar Header */}
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <Link
          href="/"
          onClick={handleNavigation}
          className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-sidebar-accent"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Bike size={24} aria-hidden="true" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-base font-bold text-sidebar-foreground">
              {siteConfig.name}
            </p>

            <p className="truncate text-xs text-muted-foreground">
              {role
                ? `${role.replaceAll("_", " ").toLowerCase()} dashboard`
                : "Dashboard"}
            </p>
          </div>
        </Link>
      </SidebarHeader>

      {/* Sidebar Content */}
      <SidebarContent className="min-h-0 overflow-y-auto">
        {navItems.map((group) => (
          <SidebarGroup key={group.title}>
            {/* Group Title */}
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = isItemActive(item.href);

                  const Icon = item.icon;

                  const count = badgeCount(item.badge);

                  return (
                    <SidebarMenuItem key={item.href} className="py-0.5">
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={item.label}
                        className="h-10 text-sm"
                        render={
                          <Link
                            href={item.href}
                            onClick={handleNavigation}
                            aria-current={isActive ? "page" : undefined}
                          />
                        }
                      >
                        <Icon className="size-4" aria-hidden="true" />

                        <span>{item.label}</span>

                        {count > 0 && (
                          <span
                            className="ml-auto rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold leading-none text-primary-foreground"
                            aria-label={badgeLabel(item.badge, count)}
                          >
                            {count > 99 ? "99+" : count}
                          </span>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Sidebar Footer */}
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="rounded-xl bg-sidebar-accent p-3">
          <p className="truncate text-sm font-semibold text-sidebar-foreground">
            {user?.data?.name || "User"}
          </p>

          <p className="mt-1 truncate text-xs text-muted-foreground">
            {user?.data?.email || user?.data?.phone || ""}
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
