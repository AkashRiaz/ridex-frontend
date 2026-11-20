import { IVehicleTypeSummary } from "./vehicle-type.type";

export type IBrand = {
  id: string;
  name: string;
  slug: string;
  country: string | null;
  description: string | null;
  logoUrl: string | null;
  isPopular: boolean;
  isActive: boolean;
  vehicleTypes: IVehicleTypeSummary[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    models: number;
  };
};

export type IBrandSummary = Pick<IBrand, "id" | "name" | "slug" | "logoUrl">;
