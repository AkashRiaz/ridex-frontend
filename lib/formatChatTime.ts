import { siteConfig } from "./siteConfig";

const locale = siteConfig.currency.locale;

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

const DAY = 24 * 60 * 60 * 1000;

// "10:42" · "Yesterday" · "Mon" · "12 Nov" — for inbox rows and notification lists
export const formatChatTime = (value: string | Date) => {
  const date = new Date(value);
  const days = Math.round((startOfDay(new Date()) - startOfDay(date)) / DAY);

  if (days <= 0) return date.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" });
  if (days === 1) return "Yesterday";
  if (days < 7) return date.toLocaleDateString(locale, { weekday: "short" });

  return date.toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    ...(date.getFullYear() !== new Date().getFullYear() && { year: "numeric" }),
  });
};

// "10:42" — under a message bubble
export const formatMessageTime = (value: string | Date) =>
  new Date(value).toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" });

// "Today" · "Yesterday" · "Monday, 12 November" — date separators in a thread
export const formatDayLabel = (value: string | Date) => {
  const date = new Date(value);
  const days = Math.round((startOfDay(new Date()) - startOfDay(date)) / DAY);

  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";

  return date.toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    ...(date.getFullYear() !== new Date().getFullYear() && { year: "numeric" }),
  });
};

export const isSameDay = (first: string | Date, second: string | Date) =>
  startOfDay(new Date(first)) === startOfDay(new Date(second));
