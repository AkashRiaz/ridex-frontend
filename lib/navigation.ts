import { getDashboardPath } from "./dashboardPath";

/*
 * Public navigation shared by the Navbar, the mobile bottom nav and the Footer.
 * Pages are added here phase by phase.
 */
export const PUBLIC_NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Browse bikes", href: "/listings" },
  { label: "Categories", href: "/#categories" },
  { label: "Brands", href: "/#brands" },
];

/*
 * "Sell" goes to the wizard for sellers/dealers, to the buyer upgrade card for
 * buyers, and to sign-up for visitors. Other roles (staff) don't sell → null.
 */
export const getSellHref = (role: string | null | undefined) => {
  if (role === "SELLER" || role === "DEALER") return `${getDashboardPath(role)}/create-listing`;
  if (role === "BUYER") return "/buyer-dashboard";
  if (role) return null;
  return "/register";
};

// hash links ("/#brands") are never "active": they are sections of the homepage
export const isActiveNavHref = (pathname: string, href: string) => {
  if (href.includes("#")) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
};
