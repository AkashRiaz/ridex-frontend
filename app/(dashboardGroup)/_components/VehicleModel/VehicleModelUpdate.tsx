import { IBrand, IVehicleModel, IVehicleType } from "@/types";
import VehicleModelForm from "./VehicleModelForm";

/*
 * Edit form for an existing model (same fields as VehicleModelCreate).
 */
const VehicleModelUpdate = ({
  vehicleModel,
  vehicleTypes,
  brands,
  dashboardPath,
}: {
  vehicleModel: IVehicleModel;
  vehicleTypes: IVehicleType[];
  brands: IBrand[];
  dashboardPath: string;
}) => (
  <VehicleModelForm vehicleModel={vehicleModel} vehicleTypes={vehicleTypes} brands={brands} dashboardPath={dashboardPath} />
);

export default VehicleModelUpdate;
