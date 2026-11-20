import { ISidebarGroup } from "@/lib/type";
import { ClipboardList, LayoutDashboard, PlusCircle, UserRound } from "lucide-react";

const prefix = "/dealer-dashboard";

export const dealerRoutes: ISidebarGroup[] = [
  {
    title: "Dealer",
    items: [
      {
        label: "Overview",
        href: `${prefix}`,
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Listings",
    items: [
      {
        label: "My Listings",
        href: `${prefix}/my-listings`,
        icon: ClipboardList,
      },
      {
        label: "Create Listing",
        href: `${prefix}/create-listing`,
        icon: PlusCircle,
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
