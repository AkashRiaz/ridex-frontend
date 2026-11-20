import Link from "next/link";
import { Bike, Mail } from "lucide-react";
import { siteConfig } from "@/lib/siteConfig";

const exploreLinks = [{ label: "Home", href: "/" }];

const Footer = () => {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        <div className="space-y-3">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Bike size={20} aria-hidden="true" />
            </div>
            <span className="text-lg font-extrabold">{siteConfig.name}</span>
          </Link>
          <p className="max-w-xs text-sm text-muted-foreground">
            {siteConfig.tagline}
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold">Explore</h2>
          <ul className="mt-3 space-y-2">
            {exploreLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground transition hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold">Contact</h2>
          <a
            href={`mailto:${siteConfig.supportEmail}`}
            className="mt-3 flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <Mail className="size-4" aria-hidden="true" />
            {siteConfig.supportEmail}
          </a>
        </div>
      </div>

      <div className="border-t py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
