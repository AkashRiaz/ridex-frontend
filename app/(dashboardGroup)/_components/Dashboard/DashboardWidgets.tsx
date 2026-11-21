import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";
import { ArrowRight, BarChart3, Bike, LucideIcon, TrendingDown, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/formatCurrency";
import { cn } from "@/lib/utils";
import { TDashboardRange } from "@/types";

/*
 * Server-safe building blocks shared by every role overview
 * (reference AdminDashboardOverview card styles).
 */

export const DASHBOARD_RANGES: { value: TDashboardRange; label: string }[] = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
];

export const toDashboardRange = (value: string | string[] | undefined): TDashboardRange => {
  const resolved = Array.isArray(value) ? value[0] : value;
  return DASHBOARD_RANGES.some((range) => range.value === resolved) ? (resolved as TDashboardRange) : "30d";
};

export const rangeLabel = (range: TDashboardRange) =>
  DASHBOARD_RANGES.find((item) => item.value === range)?.label ?? "30 days";

export const formatNumber = (value: number) => value.toLocaleString("en-US");

// "2026-11-21T…" → "21 Nov 2026"
export const formatDate = (value: string | null | undefined) =>
  value ? new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

// how long something has waited, for queues
export const formatAge = (value: string | null | undefined) => {
  if (!value) return "—";

  const hours = Math.max(0, (Date.now() - new Date(value).getTime()) / 3_600_000);

  if (hours < 1) return "under 1h";
  if (hours < 48) return `${Math.floor(hours)}h`;
  return `${Math.floor(hours / 24)}d`;
};

// ============================================
// Layout
// ============================================

export function DashboardShell({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-[1600px] space-y-6 p-2 md:p-5">{children}</div>;
}

export function DashboardHeader({
  title,
  description,
  range,
  basePath,
  actions,
}: {
  title: string;
  description?: string;
  range: TDashboardRange;
  basePath: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {actions}
        <Tabs aria-label="Date range">
          <TabsList>
            {DASHBOARD_RANGES.map((item) => (
              <TabsTrigger
                key={item.value}
                href={item.value === "30d" ? basePath : `${basePath}?range=${item.value}`}
                active={range === item.value}
                replace
                scroll={false}
              >
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}

// ============================================
// Stat cards
// ============================================

export function ChangeBadge({ change, invert = false }: { change: number | null | undefined; invert?: boolean }) {
  if (change === null || change === undefined) return null;

  // for reports, fewer is better
  const isGood = invert ? change <= 0 : change >= 0;
  const Icon = change >= 0 ? TrendingUp : TrendingDown;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        isGood ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive",
      )}
      title="Compared with the previous period"
    >
      <Icon className="size-3" aria-hidden="true" />
      {change > 0 ? "+" : ""}
      {change}%
    </span>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  change,
  invertChange,
  href,
}: {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  hint?: ReactNode;
  change?: number | null;
  invertChange?: boolean;
  href?: string;
}) {
  const body = (
    <div className="group relative h-full overflow-hidden rounded-2xl border bg-card p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-md motion-reduce:transform-none">
      <div className="pointer-events-none absolute -right-12 -top-12 size-28 rounded-full bg-primary/10 blur-3xl transition group-hover:bg-primary/20" />
      <div className="relative">
        <div className="flex items-start justify-between gap-2">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="size-5" aria-hidden="true" />
          </div>
          <ChangeBadge change={change} invert={invertChange} />
        </div>
        <p className="mt-4 text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-bold tracking-tight tabular-nums">{value}</p>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </div>
    </div>
  );

  return href ? (
    <Link href={href} className="block rounded-2xl focus-visible:outline-2 focus-visible:outline-ring">
      {body}
    </Link>
  ) : (
    body
  );
}

export function StatGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{children}</div>;
}

// ============================================
// Cards
// ============================================

export function ChartCard({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("min-w-0 rounded-2xl border bg-card p-5 shadow-card", className)}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function EmptyChart({ message = "No data for this period yet." }: { message?: string }) {
  return (
    <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-center text-sm text-muted-foreground">
      <BarChart3 className="size-6 opacity-60" aria-hidden="true" />
      {message}
    </div>
  );
}

export function CardLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline"
    >
      {children}
      <ArrowRight className="size-3" aria-hidden="true" />
    </Link>
  );
}

export function MiniStat({ label, value, tone }: { label: string; value: ReactNode; tone?: "warning" | "success" }) {
  return (
    <div className="rounded-xl border bg-muted/20 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-1 text-xl font-bold tabular-nums",
          tone === "warning" && "text-warning",
          tone === "success" && "text-success",
        )}
      >
        {value}
      </p>
    </div>
  );
}

// "Review 12 pending listings →"
export function QueueAlert({ count, label, href }: { count: number; label: string; href: string }) {
  if (count <= 0) return null;

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-full border border-warning/30 bg-warning/10 px-3 py-1.5 text-xs font-medium text-warning transition hover:bg-warning/15"
    >
      <span className="size-1.5 rounded-full bg-warning" aria-hidden="true" />
      {label.replace("{count}", formatNumber(count))}
      <ArrowRight className="size-3" aria-hidden="true" />
    </Link>
  );
}

export function ListingThumb({
  title,
  coverImage,
  price,
  meta,
  href,
}: {
  title: string;
  coverImage: string | null;
  price?: number;
  meta?: ReactNode;
  href: string;
}) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-muted/60">
      <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
        {coverImage ? (
          <Image src={coverImage} alt="" fill sizes="48px" className="object-cover" />
        ) : (
          <Bike className="absolute inset-0 m-auto size-5 text-muted-foreground" aria-hidden="true" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{title}</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
          {price !== undefined && <span className="font-medium text-foreground">{formatCurrency(price)}</span>}
          {meta}
        </div>
      </div>
    </Link>
  );
}

export function EmptyList({ message }: { message: string }) {
  return <p className="py-8 text-center text-sm text-muted-foreground">{message}</p>;
}

// ============================================
// Loading skeleton shared by every overview
// ============================================

export function DashboardOverviewSkeleton({ charts = 4 }: { charts?: number }) {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading dashboard">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
          <div key={index} className="rounded-2xl border bg-card p-5 shadow-card">
            <Skeleton className="size-10 rounded-xl" />
            <Skeleton className="mt-4 h-4 w-24" />
            <Skeleton className="mt-2 h-7 w-20" />
            <Skeleton className="mt-2 h-3 w-32" />
          </div>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.4fr_0.6fr]">
        <div className="rounded-2xl border bg-card p-5 shadow-card">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-4 h-64 w-full" />
        </div>
        <div className="rounded-2xl border bg-card p-5 shadow-card">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="mx-auto mt-6 size-48 rounded-full" />
        </div>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        {Array.from({ length: Math.max(0, charts - 2) }).map((_, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
          <div key={index} className="rounded-2xl border bg-card p-5 shadow-card">
            <Skeleton className="h-5 w-36" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 5 }).map((__, row) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
                <Skeleton key={row} className="h-8 w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
