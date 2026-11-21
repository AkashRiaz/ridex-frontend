import { IBrand, IVehicleType } from "@/types";
import BrandForm from "./BrandForm";

/*
 * Edit form for an existing brand (same fields as BrandCreate).
 */
const BrandUpdate = ({
  brand,
  vehicleTypes,
  dashboardPath,
}: {
  brand: IBrand;
  vehicleTypes: IVehicleType[];
  dashboardPath: string;
}) => (
  <BrandForm brand={brand} vehicleTypes={vehicleTypes} dashboardPath={dashboardPath} />
);

export default BrandUpdate;
