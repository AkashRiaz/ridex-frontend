import { ISidebarGroup } from "@/lib/type";
import { Flag, Heart, History, LayoutDashboard, ShieldCheck, Star, UserRound } from "lucide-react";

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
        label: "My Profile",
        href: `${prefix}/profile`,
        icon: UserRound,
      },
    ],
  },
];
