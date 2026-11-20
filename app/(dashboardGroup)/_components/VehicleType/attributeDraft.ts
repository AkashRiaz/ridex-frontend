import { AttributeFormInput } from "@/components/validations/vehicle-type.validation";
import { IVehicleAttribute } from "@/types";

/*
 * Form-friendly copy of an attribute (numbers as strings, no undefined).
 */
export type TAttributeDraft = AttributeFormInput & {
  uid: string;
  // saved on the server → key is locked (it is the field name in stored specs)
  isPersisted: boolean;
};

let uidCounter = 0;
const nextUid = () => `attr-${Date.now()}-${uidCounter++}`;

export const toDraft = (attribute: IVehicleAttribute): TAttributeDraft => ({
  uid: nextUid(),
  isPersisted: true,
  key: attribute.key,
  label: attribute.label,
  type: attribute.type,
  unit: attribute.unit ?? "",
  options: attribute.options ?? [],
  min: attribute.min?.toString() ?? "",
  max: attribute.max?.toString() ?? "",
  step: attribute.step?.toString() ?? "",
  required: attribute.required,
  filterable: attribute.filterable,
  showInCard: attribute.showInCard,
  group: attribute.group,
  placeholder: attribute.placeholder ?? "",
  helpText: attribute.helpText ?? "",
});

export const newDraft = (group = "General"): TAttributeDraft => ({
  uid: nextUid(),
  isPersisted: false,
  key: "",
  label: "",
  type: "TEXT",
  unit: "",
  options: [],
  min: "",
  max: "",
  step: "",
  required: false,
  filterable: false,
  showInCard: false,
  group,
  placeholder: "",
  helpText: "",
});

const optionalNumber = (value: string) => (value.trim() === "" ? undefined : Number(value));
const optionalText = (value: string) => (value.trim() === "" ? undefined : value.trim());

export const fromDraft = (draft: TAttributeDraft, index: number): IVehicleAttribute => {
  const isNumber = draft.type === "NUMBER";
  const hasOptions = draft.type === "SELECT" || draft.type === "MULTI_SELECT";

  return {
    key: draft.key.trim(),
    label: draft.label.trim(),
    type: draft.type,
    unit: isNumber ? optionalText(draft.unit) : undefined,
    options: hasOptions ? draft.options.map((option) => ({ ...option })) : undefined,
    min: isNumber ? optionalNumber(draft.min) : undefined,
    max: isNumber ? optionalNumber(draft.max) : undefined,
    step: isNumber ? optionalNumber(draft.step) : undefined,
    required: draft.required,
    filterable: draft.type === "TEXT" ? false : draft.filterable,
    showInCard: draft.showInCard,
    group: draft.group.trim() || "General",
    sortOrder: (index + 1) * 10,
    placeholder: optionalText(draft.placeholder),
    helpText: optionalText(draft.helpText),
  };
};

// "Engine capacity (cc)" → "engineCapacityCc"
export const labelToKey = (label: string) => {
  const words = label
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);

  const key = words
    .map((word, index) =>
      index === 0
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    )
    .join("")
    .replace(/^[0-9]+/, "");

  return key.slice(0, 40);
};

// "Dual-channel ABS" → "dual-channel-abs"
export const labelToOptionValue = (label: string) =>
  label
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
