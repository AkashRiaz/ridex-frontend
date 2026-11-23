import { ISidebarGroup } from "@/lib/type";
import { Bell, Bike, Building2, ClipboardCheck, Flag, History, Landmark, Layers, LayoutDashboard, ShieldCheck, Tag, UserPlus, UserRound, Users } from "lucide-react";

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
        badge: "listings",
      },
      {
        label: "Reports",
        href: `${prefix}/reports`,
        icon: Flag,
        badge: "reports",
      },
      {
        label: "Verifications",
        href: `${prefix}/verifications`,
        icon: ShieldCheck,
        badge: "verifications",
      },
      {
        label: "Loan Leads",
        href: `${prefix}/loan-leads`,
        icon: Landmark,
        badge: "loanLeads",
      },
      {
        label: "Finance Partners",
        href: `${prefix}/finance-partners`,
        icon: Building2,
      },
      {
        label: "Users",
        href: `${prefix}/users`,
        icon: Users,
      },
      {
        label: "Audit Log",
        href: `${prefix}/audit-logs`,
        icon: History,
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
        label: "Notifications",
        href: `${prefix}/notifications`,
        icon: Bell,
        badge: "notifications",
      },
      {
        label: "My Profile",
        href: `${prefix}/profile`,
        icon: UserRound,
      },
    ],
  },
];
