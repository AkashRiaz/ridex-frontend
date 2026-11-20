import z from "zod";
import { SlugZodSchema } from "./vehicle-type.validation";

/*
 * Mirrors ridex-backend/src/app/module/vehicleModel/vehicleModel.validation.ts
 * (defaultSpecs are validated with buildSpecSchema from the selected vehicle type)
 */

const currentYear = new Date().getFullYear();

const OptionalYearZodSchema = z
  .string()
  .trim()
  .refine(
    (value) =>
      value === "" ||
      (/^\d{4}$/.test(value) && Number(value) >= 1950 && Number(value) <= currentYear + 1),
    `Enter a year between 1950 and ${currentYear + 1}`,
  );

export const VehicleModelZodSchema = z
  .object({
    vehicleTypeId: z.string().min(1, "Select a vehicle type"),
    brandId: z.string().min(1, "Select a brand"),
    name: z
      .string()
      .trim()
      .min(1, "Model name is required")
      .max(80, "Model name must be at most 80 characters long"),
    slug: SlugZodSchema,
    yearFrom: OptionalYearZodSchema,
    yearTo: OptionalYearZodSchema,
    isActive: z.boolean(),
  })
  .refine(
    (data) => !data.yearFrom || !data.yearTo || Number(data.yearFrom) <= Number(data.yearTo),
    { message: "Year from must be before year to", path: ["yearTo"] },
  );

export type VehicleModelInput = z.input<typeof VehicleModelZodSchema>;
