import { IBrand, IVehicleType } from "@/types";
import VehicleModelForm from "./VehicleModelForm";

/*
 * Create page form (VehicleModelForm without an existing model).
 */
const VehicleModelCreate = ({
  vehicleTypes,
  brands,
  dashboardPath,
}: {
  vehicleTypes: IVehicleType[];
  brands: IBrand[];
  dashboardPath: string;
}) => (
  <VehicleModelForm vehicleTypes={vehicleTypes} brands={brands} dashboardPath={dashboardPath} />
);

export default VehicleModelCreate;
