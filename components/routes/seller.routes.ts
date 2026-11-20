import { ISidebarGroup } from "@/lib/type";
import { LayoutDashboard } from "lucide-react";

const prefix = "/seller-dashboard";

export const sellerRoutes: ISidebarGroup[] = [
  {
    title: "Seller",
    items: [
      {
        label: "Overview",
        href: `${prefix}`,
        icon: LayoutDashboard,
      },
    ],
  },
];
