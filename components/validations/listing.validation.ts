import z from "zod";
import { findDistrict } from "@/lib/bdLocations";
import { LISTING_LIMITS } from "@/lib/enum";

/*
 * Mirrors ridex-backend/src/app/module/listing/listing.validation.ts
 * (one schema per wizard step).
 */

const currentYear = new Date().getFullYear();

export const ListingVehicleStepZodSchema = z.object({
  vehicleTypeId: z.string().min(1, "Select a vehicle type"),
  brandId: z.string().min(1, "Select a brand"),
  vehicleModelId: z.string(),
  year: z
    .string()
    .trim()
    .refine(
      (value) => /^\d{4}$/.test(value) && Number(value) >= 1950 && Number(value) <= currentYear + 1,
      `Enter a year between 1950 and ${currentYear + 1}`,
    ),
});

export const ListingDetailsStepZodSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(LISTING_LIMITS.titleMin, `Title must be at least ${LISTING_LIMITS.titleMin} characters`)
      .max(LISTING_LIMITS.titleMax, `Title must be at most ${LISTING_LIMITS.titleMax} characters`),
    price: z
      .string()
      .trim()
      .refine((value) => /^\d+$/.test(value), "Enter the price in taka (numbers only)")
      .refine(
        (value) => Number(value) >= LISTING_LIMITS.priceMin && Number(value) <= LISTING_LIMITS.priceMax,
        `Price must be between ${LISTING_LIMITS.priceMin.toLocaleString()} and ${LISTING_LIMITS.priceMax.toLocaleString()}`,
      ),
    isNegotiable: z.boolean(),
    condition: z.enum(["NEW", "USED", "RECONDITIONED"], { message: "Select the condition" }),
    mileage: z
      .string()
      .trim()
      .refine(
        (value) => /^\d+$/.test(value) && Number(value) <= LISTING_LIMITS.mileageMax,
        "Enter kilometres driven (numbers only)",
      ),
    color: z.string().trim().max(30, "Color must be at most 30 characters"),
    description: z
      .string()
      .trim()
      .max(
        LISTING_LIMITS.descriptionMax,
        `Description must be at most ${LISTING_LIMITS.descriptionMax} characters`,
      ),
    division: z.string().min(1, "Select a division"),
    district: z.string().min(1, "Select a district"),
    area: z.string().trim().max(100, "Area must be at most 100 characters"),
  })
  .refine((data) => Boolean(findDistrict(data.division, data.district)), {
    message: "Select a district in the chosen division",
    path: ["district"],
  });

export const VideoUrlZodSchema = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || /^https?:\/\/\S+$/i.test(value),
    "Enter a full link starting with https://",
  );

export type ListingVehicleStepInput = z.input<typeof ListingVehicleStepZodSchema>;
export type ListingDetailsStepInput = z.input<typeof ListingDetailsStepZodSchema>;
