import { IFinancePartner } from "@/types";
import FinancePartnerForm from "./FinancePartnerForm";

/*
 * Edit form for an existing finance partner (same fields as FinancePartnerCreate).
 */
const FinancePartnerUpdate = ({ partner, dashboardPath }: { partner: IFinancePartner; dashboardPath: string }) => (
  <FinancePartnerForm partner={partner} dashboardPath={dashboardPath} />
);

export default FinancePartnerUpdate;
