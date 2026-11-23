import { getMyOpenLoanLeadForListingAction } from "@/app/(dashboardGroup)/_actions/loanLeadActions";
import { getActiveFinancePartnersAction } from "@/app/(publicGroup)/_actions/financePartnerActions";
import { getDashboardPath } from "@/lib/dashboardPath";
import { isChatRole } from "@/lib/enum";
import { IUser } from "@/types";
import { EmiCalculator } from "./EmiCalculator";

type EmiCalculatorPanelProps = {
  listing: { id: string; title: string; price: number };
  isOwner: boolean;
  viewer: IUser | null;
};

const FALLBACK_DEFAULTS = { interestRate: 12, minDownPaymentPercent: 10 };

/*
 * Server component: wrap in <Suspense fallback={<EmiCalculatorSkeleton />}>.
 * The calculator still works when the partner list fails (typical rate only).
 */
export async function EmiCalculatorPanel({ listing, isOwner, viewer }: EmiCalculatorPanelProps) {
  const canApply = Boolean(viewer && !isOwner && isChatRole(viewer.role));

  const [financeResult, openLead] = await Promise.all([
    getActiveFinancePartnersAction(),
    canApply ? getMyOpenLoanLeadForListingAction(listing.id) : Promise.resolve(null),
  ]);

  const finance = financeResult.data ?? { partners: [], defaults: FALLBACK_DEFAULTS };

  return (
    <EmiCalculator
      listing={listing}
      finance={finance}
      mode={canApply ? "apply" : viewer || isOwner ? "none" : "sign-in"}
      openLead={openLead}
      dashboardPath={getDashboardPath(viewer?.role)}
      applicant={{
        fullName: viewer?.name ?? "",
        phone: viewer?.phone ?? "",
        email: viewer?.email ?? "",
        district: viewer?.district ?? "",
      }}
    />
  );
}
