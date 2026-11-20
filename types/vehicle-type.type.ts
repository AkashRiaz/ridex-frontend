// Mirrors ridex-backend/src/app/module/vehicleType/vehicleType.interface.ts
export const ATTRIBUTE_TYPES = [
  "TEXT",
  "NUMBER",
  "SELECT",
  "MULTI_SELECT",
  "BOOLEAN",
] as const;

export type TAttributeType = (typeof ATTRIBUTE_TYPES)[number];

export type IAttributeOption = {
  value: string;
  label: string;
};

export type IVehicleAttribute = {
  key: string;
  label: string;
  type: TAttributeType;
  unit?: string;
  options?: IAttributeOption[];
  min?: number;
  max?: number;
  step?: number;
  required: boolean;
  filterable: boolean;
  showInCard: boolean;
  group: string;
  sortOrder: number;
  placeholder?: string;
  helpText?: string;
};

export type TSpecValue = string | number | boolean | string[];

export type TSpecs = Record<string, TSpecValue>;

export type IVehicleType = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  imageUrl: string | null;
  attributes: IVehicleAttribute[];
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    brands: number;
    models: number;
  };
};

export type IVehicleTypeSummary = Pick<IVehicleType, "id" | "name" | "slug" | "icon">;
