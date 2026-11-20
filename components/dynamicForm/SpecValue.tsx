import { IVehicleAttribute, TSpecValue } from "@/types";

/*
 * Human-readable value for a spec: "150 cc", "Dual-channel", "Yes", "LED headlight, USB charging".
 */
export const formatSpecValue = (
  attribute: IVehicleAttribute,
  value: TSpecValue | undefined,
): string | null => {
  if (value === undefined || value === null || value === "") return null;

  const optionLabel = (optionValue: string) =>
    attribute.options?.find((option) => option.value === optionValue)?.label ?? optionValue;

  switch (attribute.type) {
    case "NUMBER":
      return attribute.unit ? `${value} ${attribute.unit}` : String(value);
    case "BOOLEAN":
      return value === true || value === "true" ? "Yes" : "No";
    case "SELECT":
      return optionLabel(String(value));
    case "MULTI_SELECT":
      return Array.isArray(value) && value.length > 0
        ? value.map(optionLabel).join(", ")
        : null;
    default:
      return String(value);
  }
};

export function SpecValue({
  attribute,
  value,
  fallback = "—",
}: {
  attribute: IVehicleAttribute;
  value: TSpecValue | undefined;
  fallback?: string;
}) {
  return <>{formatSpecValue(attribute, value) ?? fallback}</>;
}
