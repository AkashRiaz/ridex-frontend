import { ISidebarGroup } from "@/lib/type";
import { Ban, Bell, BellRing, CalendarClock, Flag, HandCoins, Heart, History, LayoutDashboard, MessageCircle, ShieldCheck, Star, UserRound } from "lucide-react";

const prefix = "/buyer-dashboard";

export const buyerRoutes: ISidebarGroup[] = [
  {
    title: "Buyer",
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
      {
        label: "Offers",
        href: `${prefix}/offers`,
        icon: HandCoins,
      },
      {
        label: "Test Rides",
        href: `${prefix}/test-rides`,
        icon: CalendarClock,
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
        label: "Saved Searches",
        href: `${prefix}/saved-searches`,
        icon: BellRing,
      },
      {
        label: "Recently Viewed",
        href: `${prefix}/recently-viewed`,
        icon: History,
      },
      {
        label: "Reviews",
        href: `${prefix}/reviews`,
        icon: Star,
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
        label: "Verification",
        href: `${prefix}/verification`,
        icon: ShieldCheck,
      },
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
