import { BadgeCheck, Flag, LockKeyhole, Star } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";

// only things the platform actually does today (Phase 1)
const POINTS = [
  {
    title: "Verified badges",
    text: "Sellers can verify their phone, ID or dealer business. Badges show on every listing.",
    icon: BadgeCheck,
  },
  {
    title: "Private chat",
    text: "Talk inside the app. Block or report anyone with one tap.",
    icon: LockKeyhole,
  },
  {
    title: "Honest reviews",
    text: "Only verified buyers who viewed, saved or asked about a bike can review its seller.",
    icon: Star,
  },
  {
    title: "Real moderators",
    text: "Every listing is reviewed before it goes live, and reports are handled by our team.",
    icon: Flag,
  },
];

const TrustSection = () => {
  return (
    <Stagger as="ul" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {POINTS.map(({ title, text, icon: Icon }) => (
        <StaggerItem as="li" key={title}>
          <div className="h-full rounded-2xl border bg-card p-5 shadow-card">
            <span className="flex size-11 items-center justify-center rounded-xl bg-success/10 text-success">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <h3 className="mt-4 font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{text}</p>
          </div>
        </StaggerItem>
      ))}
    </Stagger>
  );
};

export default TrustSection;
