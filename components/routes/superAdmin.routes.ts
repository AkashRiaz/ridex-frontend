import { ISidebarGroup } from "@/lib/type";
import { Bike, ClipboardCheck, Layers, LayoutDashboard, Tag, UserPlus, UserRound, Users } from "lucide-react";

const prefix = "/super-admin-dashboard";

export const superAdminRoutes: ISidebarGroup[] = [
  {
    title: "Super Admin",
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
      {
        label: "Create User",
        href: `${prefix}/create-user`,
        icon: UserPlus,
      },
    ],
  },
  {
    title: "Catalog",
    items: [
      {
        label: "Vehicle Types",
        href: `${prefix}/vehicle-types`,
        icon: Layers,
      },
      {
        label: "Brands",
        href: `${prefix}/brands`,
        icon: Tag,
      },
      {
        label: "Models",
        href: `${prefix}/vehicle-models`,
        icon: Bike,
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
