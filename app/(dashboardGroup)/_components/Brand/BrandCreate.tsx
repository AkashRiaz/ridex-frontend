import { IVehicleType } from "@/types";
import BrandForm from "./BrandForm";

/*
 * Create page form (BrandForm without an existing brand).
 */
const BrandCreate = ({
  vehicleTypes,
  dashboardPath,
}: {
  vehicleTypes: IVehicleType[];
  dashboardPath: string;
}) => <BrandForm vehicleTypes={vehicleTypes} dashboardPath={dashboardPath} />;

export default BrandCreate;
