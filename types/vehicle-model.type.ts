import { IBrandSummary } from "./brand.type";
import { IVehicleAttribute, IVehicleTypeSummary, TSpecs } from "./vehicle-type.type";

export type IVehicleModel = {
  id: string;
  brandId: string;
  vehicleTypeId: string;
  name: string;
  slug: string;
  yearFrom: number | null;
  yearTo: number | null;
  imageUrl: string | null;
  defaultSpecs: TSpecs;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  brand: IBrandSummary;
  // detail endpoint also returns the attribute schema
  vehicleType: IVehicleTypeSummary & { attributes?: IVehicleAttribute[] };
};
