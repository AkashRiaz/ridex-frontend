import { ISidebarGroup } from "@/lib/type";
import { Ban, Bell, Flag, Heart, History, LayoutDashboard, MessageCircle, UserRound } from "lucide-react";

const prefix = "/dealer-staff-dashboard";

export const dealerStaffRoutes: ISidebarGroup[] = [
  {
    title: "Dealer Staff",
    items: [
      {
        label: "Overview",
        href: `${prefix}`,
        icon: LayoutDashboard,
      },
      {
        label: "Messages",
        href: `${prefix}/messages`,
        icon: MessageCircle,
        badge: "chat",
      },
    ],
  },
  {
    title: "Activity",
    items: [
      {
        label: "Saved",
        href: `${prefix}/saved`,
        icon: Heart,
      },
      {
        label: "Recently Viewed",
        href: `${prefix}/recently-viewed`,
        icon: History,
      },
      {
        label: "My Reports",
        href: `${prefix}/my-reports`,
        icon: Flag,
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        label: "Notifications",
        href: `${prefix}/notifications`,
        icon: Bell,
        badge: "notifications",
      },
      {
        label: "Blocked Users",
        href: `${prefix}/blocked-users`,
        icon: Ban,
      },
      {
        label: "My Profile",
        href: `${prefix}/profile`,
        icon: UserRound,
      },
    ],
  },
];
