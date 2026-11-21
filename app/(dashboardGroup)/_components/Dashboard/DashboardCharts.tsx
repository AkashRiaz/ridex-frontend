"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

/*
 * Thin wrappers over the shadcn chart (recharts) so every overview
 * draws charts the same way. Colors come from the --chart-N tokens,
 * so light and dark mode both work. Server components pass plain data.
 */

const CHART_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

export type TChartSeries = {
  key: string;
  label: string;
};

const colorAt = (index: number) => CHART_COLORS[index % CHART_COLORS.length];

// "2026-11-21" → "21 Nov" (the date is already a local day; format it as UTC so it never shifts)
const formatDay = (value: string) =>
  new Date(`${value}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

const buildConfig = (series: TChartSeries[]): ChartConfig =>
  Object.fromEntries(series.map((item, index) => [item.key, { label: item.label, color: colorAt(index) }]));

// ============================================
// Daily trend (one or more series)
// ============================================

export function TrendChart({
  data,
  series,
  className,
  stacked = false,
}: {
  data: Record<string, number | string>[];
  series: TChartSeries[];
  className?: string;
  stacked?: boolean;
}) {
  const config = buildConfig(series);
  const tickGap = data.length > 31 ? 48 : 24;

  return (
    <ChartContainer config={config} className={cn("aspect-auto h-64 w-full", className)}>
      <AreaChart data={data} margin={{ left: 0, right: 8, top: 8 }} accessibilityLayer>
        <defs>
          {series.map((item) => (
            <linearGradient key={item.key} id={`fill-${item.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={`var(--color-${item.key})`} stopOpacity={0.35} />
              <stop offset="95%" stopColor={`var(--color-${item.key})`} stopOpacity={0.02} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={tickGap}
          tickFormatter={formatDay}
        />
        <YAxis tickLine={false} axisLine={false} width={32} allowDecimals={false} />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" labelFormatter={(value) => formatDay(String(value))} />}
        />
        {series.map((item) => (
          <Area
            key={item.key}
            dataKey={item.key}
            type="monotone"
            stroke={`var(--color-${item.key})`}
            fill={`url(#fill-${item.key})`}
            strokeWidth={2}
            stackId={stacked ? "total" : undefined}
          />
        ))}
        {series.length > 1 && <ChartLegend content={<ChartLegendContent />} />}
      </AreaChart>
    </ChartContainer>
  );
}

// ============================================
// Ranked bars (top brands, divisions, reasons)
// ============================================

export function BarBreakdownChart({
  data,
  label = "Count",
  className,
}: {
  data: { label: string; count: number }[];
  label?: string;
  className?: string;
}) {
  const config: ChartConfig = { count: { label, color: colorAt(0) } };
  const height = Math.max(160, data.length * 36);

  return (
    <ChartContainer config={config} className={cn("aspect-auto w-full", className)} style={{ height }}>
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 16 }} accessibilityLayer>
        <CartesianGrid horizontal={false} />
        <XAxis type="number" hide allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="label"
          tickLine={false}
          axisLine={false}
          width={110}
          tickFormatter={(value: string) => (value.length > 16 ? `${value.slice(0, 15)}…` : value)}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent hideIndicator />} />
        <Bar dataKey="count" fill="var(--color-count)" radius={6} barSize={20} />
      </BarChart>
    </ChartContainer>
  );
}

// ============================================
// Share of a whole (status, roles)
// ============================================

export function DonutChart({
  data,
  className,
  centerLabel,
}: {
  data: { key: string; label: string; count: number }[];
  className?: string;
  centerLabel?: string;
}) {
  const visible = data.filter((item) => item.count > 0);
  const config: ChartConfig = Object.fromEntries(
    visible.map((item, index) => [item.key, { label: item.label, color: colorAt(index) }]),
  );
  const total = visible.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className={cn("relative", className)}>
      <ChartContainer config={config} className="mx-auto aspect-square h-56">
        <PieChart accessibilityLayer>
          <ChartTooltip cursor={false} content={<ChartTooltipContent nameKey="key" hideLabel />} />
          <Pie data={visible} dataKey="count" nameKey="key" innerRadius="62%" strokeWidth={2} paddingAngle={2}>
            {visible.map((item) => (
              <Cell key={item.key} fill={`var(--color-${item.key})`} />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold tabular-nums">{total.toLocaleString()}</span>
        {centerLabel && <span className="text-xs text-muted-foreground">{centerLabel}</span>}
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
        {visible.map((item, index) => (
          <li key={item.key} className="flex items-center gap-2">
            <span className="size-2.5 shrink-0 rounded-sm" style={{ background: colorAt(index) }} aria-hidden="true" />
            <span className="truncate text-muted-foreground">{item.label}</span>
            <span className="ml-auto font-medium tabular-nums">{item.count.toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
