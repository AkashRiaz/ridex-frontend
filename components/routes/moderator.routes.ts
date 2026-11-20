import { ISidebarGroup } from "@/lib/type";
import { ClipboardCheck, Flag, LayoutDashboard, UserRound, Users } from "lucide-react";

const prefix = "/moderator-dashboard";

export const moderatorRoutes: ISidebarGroup[] = [
  {
    title: "Moderation",
    items: [
      {
        label: "Overview",
        href: `${prefix}`,
        icon: LayoutDashboard,
      },
      {
        label: "Listings",
        href: `${prefix}/listings`,
        icon: ClipboardCheck,
      },
      {
        label: "Reports",
        href: `${prefix}/reports`,
        icon: Flag,
      },
      {
        label: "Users",
        href: `${prefix}/users`,
        icon: Users,
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        label: "My Profile",
        href: `${prefix}/profile`,
        icon: UserRound,
      },
    ],
  },
];
