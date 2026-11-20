import { ISidebarGroup } from "@/lib/type";
import { LayoutDashboard, UserRound } from "lucide-react";

const prefix = "/inspector-dashboard";

export const inspectorRoutes: ISidebarGroup[] = [
  {
    title: "Inspector",
    items: [
      {
        label: "Overview",
        href: `${prefix}`,
        icon: LayoutDashboard,
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
