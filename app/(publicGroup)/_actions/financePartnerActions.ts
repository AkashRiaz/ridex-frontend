"use server";

import { baseApi } from "@/service/baseApi";
import { IActiveFinancePartners } from "@/types";

/*
 * Rates and limits for the EMI calculator (public, no contact details).
 * Cached for an hour; admin changes update the "finance-partners" tag.
 */
export const getActiveFinancePartnersAction = async () =>
  baseApi<IActiveFinancePartners>("/finance-partners/active", {
    auth: false,
    revalidate: 60 * 60,
    tags: ["finance-partners"],
  });
