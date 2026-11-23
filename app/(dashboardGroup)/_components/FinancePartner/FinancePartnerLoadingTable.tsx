import { CatalogLoadingTable } from "../Catalog/CatalogStates";
import { FINANCE_PARTNER_COLUMNS } from "./FinancePartnerTable";

const FinancePartnerLoadingTable = () => <CatalogLoadingTable title="Finance partners" columns={FINANCE_PARTNER_COLUMNS} />;

export default FinancePartnerLoadingTable;
