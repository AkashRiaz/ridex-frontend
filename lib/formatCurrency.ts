import { siteConfig } from "./siteConfig";

export const formatCurrency = (amount: number | string) =>
  new Intl.NumberFormat(siteConfig.currency.locale, {
    style: "currency",
    currency: siteConfig.currency.code,
    maximumFractionDigits: 0,
  }).format(Number(amount));
