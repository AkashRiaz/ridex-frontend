import FinancePartnerForm from "./FinancePartnerForm";

/*
 * Create page form (FinancePartnerForm without an existing partner).
 */
const FinancePartnerCreate = ({ dashboardPath }: { dashboardPath: string }) => (
  <FinancePartnerForm dashboardPath={dashboardPath} />
);

export default FinancePartnerCreate;
