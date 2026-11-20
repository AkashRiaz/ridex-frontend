import { ISidebarGroup } from "@/lib/type";
import { ClipboardList, Flag, Heart, History, LayoutDashboard, PlusCircle, ShieldCheck, Star, UserRound } from "lucide-react";

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
