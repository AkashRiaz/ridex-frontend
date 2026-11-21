import VehicleTypeForm from "./VehicleTypeForm";

/*
 * Create page form (VehicleTypeForm without an existing vehicle type).
 */
const VehicleTypeCreate = ({
  dashboardPath,
}: {
  dashboardPath: string;
}) => <VehicleTypeForm dashboardPath={dashboardPath} />;

export default VehicleTypeCreate;
