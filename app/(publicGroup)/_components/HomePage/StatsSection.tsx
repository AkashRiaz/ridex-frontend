import { BadgeCheck, Bike, Handshake, MapPin } from "lucide-react";
import { CountUp } from "@/components/motion/CountUp";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { THomeDataPromise } from "./HomeSection";

/*
 * Live site numbers. Hidden entirely when the data is missing:
 * a row of zeros or errors would hurt more than it helps.
 */
const StatsSection = async ({ data }: { data: THomeDataPromise }) => {
  const result = await data;

  if (!result.success || !result.data) return null;

  const { stats } = result.data;

  const items = [
    { label: "Bikes for sale", value: stats.liveListings, icon: Bike },
    { label: "Verified sellers", value: stats.verifiedSellers, icon: BadgeCheck },
    { label: "Districts covered", value: stats.districts, icon: MapPin },
    { label: "Sold in the last 30 days", value: stats.soldLast30Days, icon: Handshake },
  ];

  return (
    <Stagger as="ul" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map(({ label, value, icon: Icon }) => (
        <StaggerItem as="li" key={label}>
          <div className="glass flex h-full items-center gap-4 rounded-2xl border p-4 shadow-card sm:p-5">
            <span className="hidden size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:flex">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <CountUp value={value} className="block font-heading text-2xl font-bold tabular-nums sm:text-3xl" />
              <span className="block text-xs text-muted-foreground sm:text-sm">{label}</span>
            </span>
          </div>
        </StaggerItem>
      ))}
    </Stagger>
  );
};

export default StatsSection;
