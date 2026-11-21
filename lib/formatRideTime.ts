import { siteConfig } from "./siteConfig";

/*
 * Test-ride times are always shown in the marketplace zone (siteConfig.timezone),
 * not the viewer's device zone, so buyer and seller read the same time.
 */

const { locale } = siteConfig.currency;
const timeZone = siteConfig.timezone;

// "Sat, 23 Nov · 10:30 AM"
export const formatRideDateTime = (value: string | Date) => {
  const date = new Date(value);
  const day = date.toLocaleDateString(locale, { timeZone, weekday: "short", day: "numeric", month: "short" });
  const time = date.toLocaleTimeString(locale, { timeZone, hour: "numeric", minute: "2-digit" });

  return `${day} · ${time}`;
};

// "10:30 AM"
export const formatRideTime = (value: string | Date) =>
  new Date(value).toLocaleTimeString(locale, { timeZone, hour: "numeric", minute: "2-digit" });

// "YYYY-MM-DD" (a local calendar day) → { weekday: "Sat", day: "23 Nov" }
export const formatRideDay = (dateKey: string) => {
  const date = new Date(`${dateKey}T12:00:00.000Z`);

  return {
    weekday: date.toLocaleDateString(locale, { timeZone: "UTC", weekday: "short" }),
    day: date.toLocaleDateString(locale, { timeZone: "UTC", day: "numeric", month: "short" }),
  };
};

// "in 2 days" style countdown for an offer's expiry
export const formatTimeLeft = (value: string | Date, now = Date.now()) => {
  const ms = new Date(value).getTime() - now;

  if (ms <= 0) return "expired";

  const hours = Math.floor(ms / 3_600_000);

  if (hours >= 24) return `${Math.floor(hours / 24)}d ${hours % 24}h left`;
  if (hours >= 1) return `${hours}h left`;

  return `${Math.max(1, Math.floor(ms / 60_000))}m left`;
};
