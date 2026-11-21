import CatalogDelete from "../Catalog/CatalogDelete";

/*
 * Delete button for one model: Swal confirm → delete action → toast → refresh.
 */
const VehicleModelDelete = ({
  id,
  name,
  showLabel,
  redirectTo,
}: {
  id: string;
  name: string;
  showLabel?: boolean;
  redirectTo?: string;
}) => <CatalogDelete entity="vehicleModel" id={id} name={name} showLabel={showLabel} redirectTo={redirectTo} />;

export default VehicleModelDelete;
