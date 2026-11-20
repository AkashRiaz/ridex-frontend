/*
 * Single place for brand + locale settings.
 * Rename the product here and nowhere else.
 */
export const siteConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || "RideX",
  tagline: "Buy, sell and ride — bikes today, every vehicle tomorrow.",
  description:
    "RideX is a multi-vehicle marketplace and rider community. Find verified bikes, talk to sellers, book test rides and join local riding groups.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  currency: {
    code: process.env.NEXT_PUBLIC_CURRENCY || "BDT",
    locale: process.env.NEXT_PUBLIC_DEFAULT_LOCALE || "en-BD",
  },
  locales: ["en", "bn"] as const,
  defaultLocale: "en" as const,
  supportEmail: "support@ridex.demo",
  social: {
    facebook: "#",
    instagram: "#",
    youtube: "#",
  },
};

export type SiteConfig = typeof siteConfig;
