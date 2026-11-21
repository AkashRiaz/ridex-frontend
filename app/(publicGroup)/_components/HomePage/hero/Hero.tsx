import Link from "next/link";
import { Suspense } from "react";
import { BadgeCheck, MessagesSquare, ShieldCheck, Sparkles } from "lucide-react";
import { siteConfig } from "@/lib/siteConfig";
import { ListingSearchBox } from "../../Search/ListingSearchBox";
import { HeroBackdrop } from "./HeroBackdrop";

const POPULAR_SEARCHES = [
  { label: "Yamaha R15", href: "/listings?searchTerm=yamaha%20r15" },
  { label: "Scooters", href: "/listings?vehicleType=bike&spec.bikeCategory=scooter" },
  { label: "Under ৳2 lakh", href: "/listings?maxPrice=200000" },
  { label: "Dual-channel ABS", href: "/listings?vehicleType=bike&spec.abs=dual-channel" },
  { label: "Brand new", href: "/listings?condition=NEW" },
];

const PROMISES = [
  { label: "Verified sellers", icon: BadgeCheck },
  { label: "Safe in-app chat", icon: MessagesSquare },
  { label: "Report anything", icon: ShieldCheck },
];

/*
 * Renders at once (no data), so the first paint is the headline + search.
 * The entrance uses CSS (tw-animate-css), which the global reduced-motion rule turns off.
 */
const Hero = () => {
  return (
    // -mt-16 pt-16: the hero slides under the see-through navbar
    <section aria-labelledby="hero-heading" className="-mt-16">
      <HeroBackdrop>
        <div className="mx-auto flex max-w-4xl flex-col items-center px-4 pb-20 pt-32 text-center sm:pb-28 sm:pt-40">
          <p className="glass inline-flex animate-in items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground fade-in slide-in-from-bottom-2 duration-700 sm:text-sm">
            <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
            Bikes today, every vehicle tomorrow
          </p>

          <h1
            id="hero-heading"
            className="mt-6 animate-in text-balance text-4xl font-bold tracking-tight fade-in slide-in-from-bottom-4 duration-700 sm:text-6xl lg:text-7xl"
          >
            Find your next{" "}
            <span className="bg-gradient-to-r from-primary via-chart-5 to-primary bg-clip-text text-transparent">
              ride
            </span>
          </h1>

          <p className="mt-5 max-w-xl animate-in text-pretty text-base text-muted-foreground fade-in slide-in-from-bottom-4 delay-100 duration-700 fill-mode-backwards sm:text-lg">
            {siteConfig.tagline}
          </p>

          <div className="mt-8 w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 delay-200 duration-700 fill-mode-backwards">
            <div className="glass rounded-2xl border p-2 shadow-elevated">
              <Suspense>
                <ListingSearchBox size="lg" />
              </Suspense>
            </div>
          </div>

          <ul
            className="mt-5 flex animate-in flex-wrap justify-center gap-2 fade-in delay-300 duration-700 fill-mode-backwards"
            aria-label="Popular searches"
          >
            {POPULAR_SEARCHES.map((search) => (
              <li key={search.label}>
                <Link
                  href={search.href}
                  className="glass inline-block rounded-full border px-3 py-1.5 text-sm transition hover:border-primary hover:text-primary active:scale-95"
                >
                  {search.label}
                </Link>
              </li>
            ))}
          </ul>

          <ul className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {PROMISES.map(({ label, icon: Icon }) => (
              <li key={label} className="inline-flex items-center gap-1.5">
                <Icon className="size-4 text-primary" aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </HeroBackdrop>
    </section>
  );
};

export default Hero;
