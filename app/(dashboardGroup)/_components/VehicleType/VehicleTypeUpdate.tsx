import { IVehicleType } from "@/types";
import VehicleTypeForm from "./VehicleTypeForm";

/*
 * Edit form for an existing vehicle type (same fields as VehicleTypeCreate).
 */
const VehicleTypeUpdate = ({
  vehicleType,
  dashboardPath,
}: {
  vehicleType: IVehicleType;
  dashboardPath: string;
}) => <VehicleTypeForm vehicleType={vehicleType} dashboardPath={dashboardPath} />;

export default VehicleTypeUpdate;
