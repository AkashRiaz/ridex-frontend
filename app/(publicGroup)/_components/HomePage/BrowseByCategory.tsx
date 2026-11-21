import Link from "next/link";
import { ArrowUpRight, Bike, Coffee, Gauge, LucideIcon, Mountain, Route, Scooter, Wind, Zap } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { HomeSectionMessage, THomeDataPromise } from "./HomeSection";

// bikeCategory option → icon (unknown options fall back to a bike)
const CATEGORY_ICON: Record<string, LucideIcon> = {
  commuter: Route,
  sports: Gauge,
  naked: Zap,
  cruiser: Wind,
  scooter: Scooter,
  adventure: Mountain,
  "off-road": Mountain,
  "cafe-racer": Coffee,
};

const formatCount = (count: number) => (count === 1 ? "1 bike" : `${count.toLocaleString("en-US")} bikes`);

const BrowseByCategory = async ({ data }: { data: THomeDataPromise }) => {
  const result = await data;

  if (!result.success || !result.data) {
    return <HomeSectionMessage>Categories are unavailable right now.</HomeSectionMessage>;
  }

  const { vehicleType, attribute, items } = result.data.categories;

  if (!vehicleType || !attribute || items.length === 0) {
    return <HomeSectionMessage>Categories will appear once the catalog is set up.</HomeSectionMessage>;
  }

  return (
    <Stagger as="ul" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((category) => {
        const Icon = CATEGORY_ICON[category.value] ?? Bike;
        const href = `/listings?vehicleType=${encodeURIComponent(vehicleType)}&spec.${attribute}=${encodeURIComponent(category.value)}`;

        return (
          <StaggerItem as="li" key={category.value}>
            <Link
              href={href}
              className="group relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-2xl border bg-card p-4 shadow-card transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-elevated active:scale-[0.98] motion-reduce:hover:translate-y-0 sm:p-5"
            >
              {/* soft glow on hover */}
              <span
                aria-hidden="true"
                className="absolute -right-8 -top-8 size-28 rounded-full bg-primary/10 opacity-0 blur-2xl transition-opacity group-hover:opacity-100"
              />
              <span className="flex items-start justify-between">
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <ArrowUpRight
                  className="size-4 text-muted-foreground transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary motion-reduce:transition-none"
                  aria-hidden="true"
                />
              </span>
              <span>
                <span className="block font-semibold leading-tight">{category.label}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {category.count > 0 ? formatCount(category.count) : "Be the first to list"}
                </span>
              </span>
            </Link>
          </StaggerItem>
        );
      })}
    </Stagger>
  );
};

export default BrowseByCategory;
