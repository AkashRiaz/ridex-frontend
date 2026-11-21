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
  // Socket.io server = the backend origin (without /api/v1)
  socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000",
  currency: {
    code: process.env.NEXT_PUBLIC_CURRENCY || "BDT",
    locale: process.env.NEXT_PUBLIC_DEFAULT_LOCALE || "en-BD",
  },
  locales: ["en", "bn"] as const,
  defaultLocale: "en" as const,
  supportEmail: "support@ridex.demo",
  // optional looping ride video behind the homepage hero (desktop only, never with reduced motion)
  heroVideoUrl: process.env.NEXT_PUBLIC_HERO_VIDEO_URL || "",
  heroPosterUrl: process.env.NEXT_PUBLIC_HERO_POSTER_URL || "",
  social: {
    facebook: "#",
    instagram: "#",
    youtube: "#",
  },
};

export type SiteConfig = typeof siteConfig;
