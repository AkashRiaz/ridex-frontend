import { CatalogLoadingTable } from "../Catalog/CatalogStates";
import { LOAN_LEAD_COLUMNS } from "./LoanLeadTable";
import { MY_LOAN_LEAD_COLUMNS } from "./MyLoanLeadTable";

/*
 * Skeleton copies of LoanLeadTable (admin) and MyLoanLeadTable (buyer).
 */
const LoanLeadLoadingTable = ({ mine = false }: { mine?: boolean }) =>
  mine ? (
    <CatalogLoadingTable title="Financing requests" columns={MY_LOAN_LEAD_COLUMNS} rows={4} />
  ) : (
    <CatalogLoadingTable title="Loan leads" columns={LOAN_LEAD_COLUMNS} />
  );

export default LoanLeadLoadingTable;
