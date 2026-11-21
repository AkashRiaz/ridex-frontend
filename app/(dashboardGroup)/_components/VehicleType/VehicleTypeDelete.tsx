import CatalogDelete from "../Catalog/CatalogDelete";

/*
 * Delete button for one vehicle type: Swal confirm → delete action → toast → refresh.
 */
const VehicleTypeDelete = ({
  id,
  name,
  showLabel,
  redirectTo,
}: {
  id: string;
  name: string;
  showLabel?: boolean;
  redirectTo?: string;
}) => <CatalogDelete entity="vehicleType" id={id} name={name} showLabel={showLabel} redirectTo={redirectTo} />;

export default VehicleTypeDelete;
