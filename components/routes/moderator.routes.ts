import { ISidebarGroup } from "@/lib/type";
import { ClipboardCheck, LayoutDashboard, UserRound, Users } from "lucide-react";

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
