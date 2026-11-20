import z from "zod";
import { SlugZodSchema } from "./vehicle-type.validation";

/*
 * Mirrors ridex-backend/src/app/module/brand/brand.validation.ts
 */
export const BrandZodSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Brand name is required")
    .max(60, "Brand name must be at most 60 characters long"),
  slug: SlugZodSchema,
  country: z.string().trim().max(60, "Country must be at most 60 characters"),
  description: z.string().trim().max(1000, "Description must be at most 1000 characters"),
  vehicleTypeIds: z.array(z.string()).min(1, "Select at least one vehicle type"),
  isPopular: z.boolean(),
  isActive: z.boolean(),
});

export type BrandInput = z.input<typeof BrandZodSchema>;
