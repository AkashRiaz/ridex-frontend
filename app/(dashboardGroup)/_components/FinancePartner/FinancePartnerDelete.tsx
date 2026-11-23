import CatalogDelete from "../Catalog/CatalogDelete";

/*
 * Delete button for one finance partner: Swal confirm → delete action → toast → refresh.
 * The backend refuses (409) while loan leads refer to the partner.
 */
const FinancePartnerDelete = ({
  id,
  name,
  showLabel,
  redirectTo,
}: {
  id: string;
  name: string;
  showLabel?: boolean;
  redirectTo?: string;
}) => <CatalogDelete entity="financePartner" id={id} name={name} showLabel={showLabel} redirectTo={redirectTo} />;

export default FinancePartnerDelete;
