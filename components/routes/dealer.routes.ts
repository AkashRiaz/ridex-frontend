import { ISidebarGroup } from "@/lib/type";
import { Ban, Bell, CalendarClock, CalendarCog, ClipboardList, Flag, HandCoins, Heart, History, LayoutDashboard, MessageCircle, PlusCircle, ShieldCheck, Star, UserRound } from "lucide-react";

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
      {
        label: "Test Ride Hours",
        href: `${prefix}/test-ride-availability`,
        icon: CalendarCog,
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
