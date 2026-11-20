import z from "zod";
import { IVehicleAttribute, TSpecs } from "@/types";

/*
 * Client mirror of ridex-backend/src/app/helper/buildDynamicSpecSchema.ts.
 * Keep both in sync: same coercion, same messages, same strict keys.
 */

const isEmptyValue = (value: unknown) =>
  value === undefined ||
  value === null ||
  (typeof value === "string" && value.trim() === "") ||
  (Array.isArray(value) && value.length === 0);

const withUnit = (value: number, unit?: string) =>
  unit ? `${value} ${unit}` : String(value);

const buildFieldSchema = (attribute: IVehicleAttribute): z.ZodType => {
  const { label } = attribute;

  switch (attribute.type) {
    case "NUMBER":
      return z
        .preprocess(
          (value) => (typeof value === "string" ? Number(value.trim()) : value),
          z.number({ message: `${label} must be a number` }),
        )
        .superRefine((value, ctx) => {
          if (!Number.isFinite(value)) {
            ctx.addIssue({ code: "custom", message: `${label} must be a number` });
            return;
          }

          if (attribute.min !== undefined && value < attribute.min) {
            ctx.addIssue({
              code: "custom",
              message: `${label} must be at least ${withUnit(attribute.min, attribute.unit)}`,
            });
          }

          if (attribute.max !== undefined && value > attribute.max) {
            ctx.addIssue({
              code: "custom",
              message: `${label} must be at most ${withUnit(attribute.max, attribute.unit)}`,
            });
          }
        });

    case "BOOLEAN":
      return z.preprocess(
        (value) => (value === "true" ? true : value === "false" ? false : value),
        z.boolean({ message: `${label} must be yes or no` }),
      );

    case "SELECT": {
      const allowed = (attribute.options ?? []).map((option) => option.value);

      return z
        .string({ message: `${label} must be one of the options` })
        .refine((value) => allowed.includes(value), {
          message: `${label} has an invalid option`,
        });
    }

    case "MULTI_SELECT": {
      const allowed = (attribute.options ?? []).map((option) => option.value);

      return z
        .array(z.string(), { message: `${label} must be a list of options` })
        .refine((values) => values.every((value) => allowed.includes(value)), {
          message: `${label} has an invalid option`,
        })
        .transform((values) => Array.from(new Set(values)));
    }

    default:
      return z
        .string({ message: `${label} must be text` })
        .trim()
        .max(200, `${label} must be at most 200 characters`);
  }
};

export const buildSpecSchema = (
  attributes: IVehicleAttribute[],
  options: { partial?: boolean } = {},
) => {
  const shape: Record<string, z.ZodType> = {};

  for (const attribute of attributes) {
    shape[attribute.key] = z.preprocess(
      (value) => (isEmptyValue(value) ? undefined : value),
      buildFieldSchema(attribute).optional(),
    );
  }

  const requiredAttributes = options.partial
    ? []
    : attributes.filter((attribute) => attribute.required);

  return z
    .strictObject(shape)
    .superRefine((specs, ctx) => {
      for (const attribute of requiredAttributes) {
        if ((specs as Record<string, unknown>)[attribute.key] === undefined) {
          ctx.addIssue({
            code: "custom",
            path: [attribute.key],
            message: `${attribute.label} is required`,
          });
        }
      }
    })
    .transform(
      (specs) =>
        Object.fromEntries(
          Object.entries(specs).filter(([, value]) => value !== undefined),
        ) as TSpecs,
    );
};

/*
 * Returns clean specs, or errors keyed by attribute key (for inline field errors).
 */
export const validateSpecValues = (
  attributes: IVehicleAttribute[],
  values: Record<string, unknown>,
  options: { partial?: boolean } = {},
):
  | { success: true; data: TSpecs }
  | { success: false; errors: Record<string, string>; message: string } => {
  // only send keys that belong to the schema
  const knownKeys = new Set(attributes.map((attribute) => attribute.key));
  const picked = Object.fromEntries(
    Object.entries(values).filter(([key]) => knownKeys.has(key)),
  );

  const result = buildSpecSchema(attributes, options).safeParse(picked);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};

  for (const issue of result.error.issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !errors[key]) errors[key] = issue.message;
  }

  return {
    success: false,
    errors,
    message: result.error.issues[0]?.message ?? "Some specs are invalid",
  };
};

/*
 * Stored specs → form values (numbers/booleans as strings for inputs).
 */
export const specsToFormValues = (
  attributes: IVehicleAttribute[],
  specs: TSpecs | null | undefined,
): Record<string, string | string[]> => {
  const values: Record<string, string | string[]> = {};

  for (const attribute of attributes) {
    const value = specs?.[attribute.key];

    if (attribute.type === "MULTI_SELECT") {
      values[attribute.key] = Array.isArray(value) ? value : [];
    } else if (value === undefined || value === null) {
      values[attribute.key] = "";
    } else {
      values[attribute.key] = String(value);
    }
  }

  return values;
};
