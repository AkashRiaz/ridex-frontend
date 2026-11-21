import { CatalogLoadingTable } from "../Catalog/CatalogStates";
import { VEHICLE_MODEL_COLUMNS } from "./VehicleModelTable";

const VehicleModelLoadingTable = () => (
  <CatalogLoadingTable title="Models" columns={VEHICLE_MODEL_COLUMNS} />
);

export default VehicleModelLoadingTable;
