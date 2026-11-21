import Link from "next/link";
import { Bike, Mail } from "lucide-react";
import { PUBLIC_NAV_ITEMS } from "@/lib/navigation";
import { siteConfig } from "@/lib/siteConfig";

const CATEGORY_LINKS = [
  { label: "Scooters", value: "scooter" },
  { label: "Commuter bikes", value: "commuter" },
  { label: "Sports bikes", value: "sports" },
  { label: "Cruisers", value: "cruiser" },
].map((item) => ({
  label: item.label,
  href: `/listings?vehicleType=bike&spec.bikeCategory=${item.value}`,
}));

const SELL_LINKS = [
  { label: "Sell your bike", href: "/register" },
  { label: "Log in", href: "/login" },
  { label: "Brand-new bikes", href: "/listings?condition=NEW" },
  { label: "Under ৳2 lakh", href: "/listings?maxPrice=200000" },
];

const FOOTER_COLUMNS = [
  { title: "Explore", links: PUBLIC_NAV_ITEMS },
  { title: "Categories", links: CATEGORY_LINKS },
  { title: "Buy & sell", links: SELL_LINKS },
];

// social links are shown only once real URLs are set in siteConfig
const SOCIAL_LINKS = Object.entries(siteConfig.social)
  .filter(([, href]) => href && href !== "#")
  .map(([name, href]) => ({ label: name.charAt(0).toUpperCase() + name.slice(1), href }));

const Footer = () => {
  return (
    <footer className="border-t bg-card/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-5 lg:px-8">
        <div className="space-y-4 lg:col-span-2">
          <Link href="/" className="flex w-fit items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Bike size={20} aria-hidden="true" />
            </div>
            <span className="text-lg font-extrabold">{siteConfig.name}</span>
          </Link>
          <p className="max-w-xs text-sm text-muted-foreground">{siteConfig.tagline}</p>
          <a
            href={`mailto:${siteConfig.supportEmail}`}
            className="flex w-fit items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <Mail className="size-4" aria-hidden="true" />
            {siteConfig.supportEmail}
          </a>
          {SOCIAL_LINKS.length > 0 && (
            <ul className="flex flex-wrap gap-2" aria-label="Social media">
              {SOCIAL_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block rounded-full border px-3 py-1 text-xs text-muted-foreground transition hover:border-primary hover:text-primary"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        {FOOTER_COLUMNS.map((column) => (
          <div key={column.title}>
            <h2 className="text-sm font-semibold">{column.title}</h2>
            <ul className="mt-3 space-y-2">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground transition hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
