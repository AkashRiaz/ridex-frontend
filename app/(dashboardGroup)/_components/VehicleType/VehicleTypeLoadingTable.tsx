import { CatalogLoadingTable } from "../Catalog/CatalogStates";
import { VEHICLE_TYPE_COLUMNS } from "./VehicleTypeTable";

const VehicleTypeLoadingTable = () => (
  <CatalogLoadingTable title="Vehicle Types" columns={VEHICLE_TYPE_COLUMNS} rows={4} />
);

export default VehicleTypeLoadingTable;
