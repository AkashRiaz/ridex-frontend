import CatalogDelete from "../Catalog/CatalogDelete";

/*
 * Delete button for one brand: Swal confirm → delete action → toast → refresh.
 */
const BrandDelete = ({
  id,
  name,
  showLabel,
  redirectTo,
}: {
  id: string;
  name: string;
  showLabel?: boolean;
  redirectTo?: string;
}) => <CatalogDelete entity="brand" id={id} name={name} showLabel={showLabel} redirectTo={redirectTo} />;

export default BrandDelete;
