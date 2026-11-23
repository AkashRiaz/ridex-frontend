import { IUserResponse } from "@/types";
import { LucideProps } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";

export type TSidebarBadge = "chat" | "notifications" | "listings" | "reports" | "verifications" | "loanLeads";

export type ISidebarItem = {
  label: string;
  href: string;
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  // live count shown next to the label (unread messages, or staff queue sizes)
  badge?: TSidebarBadge;
};

export type ISidebarGroup = {
  title: string;
  items: ISidebarItem[];
};

export interface NavbarProps {
  user: IUserResponse;
}
