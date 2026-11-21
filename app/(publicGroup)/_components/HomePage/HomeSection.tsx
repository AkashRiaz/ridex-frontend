import Link from "next/link";
import { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";
import { IHomeData, TApiResponse } from "@/types";

export type THomeDataPromise = Promise<TApiResponse<IHomeData>>;

/*
 * Section wrapper used by every homepage block: same width, spacing and
 * anchor offset (scroll-mt clears the sticky navbar for /#brands links).
 */
export function HomeSection({
  id,
  title,
  description,
  link,
  children,
  className,
}: {
  id: string;
  title: string;
  description?: string;
  link?: { href: string; label: string };
  children: ReactNode;
  className?: string;
}) {
  const headingId = `${id}-heading`;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn("mx-auto max-w-7xl scroll-mt-24 space-y-6 px-4 sm:px-6 lg:px-8", className)}
    >
      <Reveal className="flex items-end justify-between gap-4">
        <div>
          <h2 id={headingId} className="text-2xl font-bold tracking-tight sm:text-3xl">
            {title}
          </h2>
          {description && <p className="mt-1 text-sm text-muted-foreground sm:text-base">{description}</p>}
        </div>
        {link && (
          <Link
            href={link.href}
            className="group inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            {link.label}
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
              aria-hidden="true"
            />
          </Link>
        )}
      </Reveal>
      {children}
    </section>
  );
}

// inline message when a section's data failed or is empty (the rest of the page still works)
export function HomeSectionMessage({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-2xl border border-dashed bg-card/50 px-4 py-10 text-center text-sm text-muted-foreground">
      {children}
    </p>
  );
}
