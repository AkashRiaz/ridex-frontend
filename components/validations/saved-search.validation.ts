import z from "zod";
import { SAVED_SEARCH_NAME_MAX } from "@/lib/enum";

/*
 * Mirrors ridex-backend/src/app/module/savedSearch/savedSearch.validation.ts.
 * The search filters themselves come from the URL and are checked by the server.
 * When saving, an empty name is fine: the server names the search from its filters.
 */
export const buildSavedSearchSettingsZodSchema = ({ nameRequired }: { nameRequired: boolean }) =>
  z.object({
    name: z
      .string()
      .trim()
      .min(nameRequired ? 1 : 0, "Give your search a name")
      .max(SAVED_SEARCH_NAME_MAX, `A name can be at most ${SAVED_SEARCH_NAME_MAX} characters`),
    alertFrequency: z.enum(["INSTANT", "DAILY", "OFF"], { message: "Choose how often to get alerts" }),
    notifyPriceDrops: z.boolean(),
  });

export type SavedSearchSettingsInput = z.input<ReturnType<typeof buildSavedSearchSettingsZodSchema>>;
