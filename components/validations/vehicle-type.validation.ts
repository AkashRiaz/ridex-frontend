import z from "zod";
import { ATTRIBUTE_TYPES } from "@/types/vehicle-type.type";

/*
 * Mirrors ridex-backend/src/app/module/vehicleType/vehicleType.validation.ts
 */

export const SlugZodSchema = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value),
    "Slug must be lowercase words separated by -",
  );

export const VehicleTypeZodSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters long")
    .max(40, "Name must be at most 40 characters long"),
  slug: SlugZodSchema,
  description: z.string().trim().max(500, "Description must be at most 500 characters"),
  icon: z.string().trim().max(40),
  sortOrder: z
    .string()
    .refine((value) => /^\d+$/.test(value), "Sort order must be a whole number"),
  isActive: z.boolean(),
});

const OPTION_TYPES = ["SELECT", "MULTI_SELECT"];

export const AttributeFormZodSchema = z
  .object({
    key: z
      .string()
      .trim()
      .regex(
        /^[a-z][a-zA-Z0-9]{1,39}$/,
        "Key must be camelCase, e.g. engineCapacity",
      ),
    label: z.string().trim().min(1, "Label is required").max(60),
    type: z.enum(ATTRIBUTE_TYPES),
    unit: z.string().trim().max(20),
    options: z.array(
      z.object({
        value: z
          .string()
          .trim()
          .regex(/^[a-z0-9][a-z0-9_-]*$/, "Option values use lowercase, numbers, - or _"),
        label: z.string().trim().min(1, "Option label is required").max(60),
      }),
    ),
    min: z.string(),
    max: z.string(),
    step: z.string(),
    required: z.boolean(),
    filterable: z.boolean(),
    showInCard: z.boolean(),
    group: z.string().trim().max(40),
    placeholder: z.string().trim().max(80),
    helpText: z.string().trim().max(200),
  })
  .superRefine((attribute, ctx) => {
    if (OPTION_TYPES.includes(attribute.type)) {
      if (attribute.options.length === 0) {
        ctx.addIssue({ code: "custom", path: ["options"], message: "Add at least one option" });
      }

      const values = attribute.options.map((option) => option.value);
      const duplicate = values.find((value, index) => values.indexOf(value) !== index);

      if (duplicate) {
        ctx.addIssue({
          code: "custom",
          path: ["options"],
          message: `Duplicate option value "${duplicate}"`,
        });
      }
    }

    if (attribute.type === "NUMBER") {
      for (const field of ["min", "max", "step"] as const) {
        if (attribute[field] !== "" && Number.isNaN(Number(attribute[field]))) {
          ctx.addIssue({ code: "custom", path: [field], message: "Must be a number" });
        }
      }

      if (
        attribute.min !== "" &&
        attribute.max !== "" &&
        Number(attribute.min) > Number(attribute.max)
      ) {
        ctx.addIssue({ code: "custom", path: ["min"], message: "Min must be ≤ max" });
      }
    }
  });

export type VehicleTypeInput = z.input<typeof VehicleTypeZodSchema>;
export type AttributeFormInput = z.input<typeof AttributeFormZodSchema>;
