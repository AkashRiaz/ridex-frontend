import Link from "next/link";
import { Check, Circle, Landmark, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatRelativeDate } from "@/components/listing/ListingBits";
import { formatRate } from "@/lib/emi";
import { LOAN_LEAD_STATUS_LABEL } from "@/lib/enum";
import { formatCurrency } from "@/lib/formatCurrency";
import { cn } from "@/lib/utils";
import { ILoanLead, TLoanLeadStatus } from "@/types";
import { CatalogThumb } from "../Catalog/CatalogThumb";

/*
 * Pieces shared by the buyer and admin loan lead pages.
 */

const statusClassName: Record<TLoanLeadStatus, string> = {
  NEW: "bg-warning/20 text-foreground",
  SENT_TO_PARTNER: "bg-primary/10 text-primary",
  CONTACTED: "bg-primary/10 text-primary",
  APPROVED: "bg-success/15 text-success",
  DISBURSED: "bg-success/15 text-success",
  REJECTED: "bg-destructive/10 text-destructive",
  WITHDRAWN: "bg-muted text-muted-foreground",
  CLOSED: "bg-muted text-muted-foreground",
};

export function LoanLeadStatusBadge({ status }: { status: TLoanLeadStatus }) {
  return <Badge className={cn("border-transparent", statusClassName[status])}>{LOAN_LEAD_STATUS_LABEL[status]}</Badge>;
}

export function LoanLeadListingCell({ lead, href }: { lead: ILoanLead; href?: string }) {
  const title = href ? (
    <Link href={href} className="line-clamp-1 font-medium hover:underline">
      {lead.listing.title}
    </Link>
  ) : (
    <p className="line-clamp-1 font-medium">{lead.listing.title}</p>
  );

  return (
    <div className="flex min-w-0 items-center gap-3">
      <CatalogThumb name={lead.listing.title} imageUrl={lead.listing.coverImage} />
      <div className="min-w-0">
        {title}
        <p className="font-mono text-xs text-muted-foreground">{lead.reference}</p>
      </div>
    </div>
  );
}

export function LoanLeadTermsSummary({ lead }: { lead: ILoanLead }) {
  const rows = [
    { label: "Listing price", value: formatCurrency(lead.listingPrice) },
    { label: "Down payment", value: formatCurrency(lead.downPayment) },
    { label: "Loan amount", value: formatCurrency(lead.loanAmount) },
    { label: "Tenure", value: `${lead.tenureMonths} months` },
    { label: "Rate (estimate)", value: `${formatRate(lead.interestRate)} a year` },
    { label: "Estimated EMI", value: formatCurrency(lead.estimatedEmi) },
    { label: "Total interest", value: formatCurrency(lead.totalInterest) },
  ];

  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {rows.map((row) => (
        <div key={row.label} className="rounded-xl bg-muted/50 p-3">
          <dt className="text-xs text-muted-foreground">{row.label}</dt>
          <dd className="mt-0.5 font-semibold tabular-nums">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function LoanLeadPartnerCard({ lead }: { lead: ILoanLead }) {
  const partner = lead.partner ?? lead.preferredPartner;

  if (!partner) return null;

  return (
    <div className="flex items-center gap-3 rounded-xl border p-3">
      <CatalogThumb name={partner.name} imageUrl={partner.logoUrl} />
      <div className="min-w-0 text-sm">
        <p className="flex items-center gap-1.5 font-medium">
          <Landmark className="size-3.5 text-muted-foreground" aria-hidden="true" />
          {partner.name}
        </p>
        <p className="text-xs text-muted-foreground">
          {lead.partner ? "Handling your request" : "Your preferred partner"}
          {lead.partnerReference && ` · Ref. ${lead.partnerReference}`}
        </p>
      </div>
    </div>
  );
}

type TStep = { key: string; label: string; at: string | null; state: "done" | "current" | "todo" | "failed" };

/*
 * Received → Sent → Contacted → Approved → Disbursed, or the step where it ended.
 */
const buildSteps = (lead: ILoanLead): TStep[] => {
  const flow: { key: TLoanLeadStatus; label: string; at: string | null }[] = [
    { key: "NEW", label: "Request received", at: lead.createdAt },
    { key: "SENT_TO_PARTNER", label: "Sent to a finance partner", at: lead.sentAt },
    { key: "CONTACTED", label: "Partner contacted you", at: lead.contactedAt },
    { key: "APPROVED", label: "Loan approved", at: lead.approvedAt },
    { key: "DISBURSED", label: "Loan disbursed", at: lead.disbursedAt },
  ];

  const isEnded = ["REJECTED", "WITHDRAWN", "CLOSED"].includes(lead.status);
  const reached = flow.filter((step) => step.at).length;

  const steps: TStep[] = flow.map((step, index) => ({
    key: step.key,
    label: step.label,
    at: step.at,
    state: step.at ? "done" : !isEnded && index === reached ? "current" : "todo",
  }));

  if (!isEnded) return steps;

  return [
    ...steps.filter((step) => step.state === "done"),
    { key: lead.status, label: LOAN_LEAD_STATUS_LABEL[lead.status], at: lead.closedAt, state: "failed" },
  ];
};

export function LoanLeadTimeline({ lead }: { lead: ILoanLead }) {
  const steps = buildSteps(lead);

  return (
    <ol className="space-y-0">
      {steps.map((step, index) => (
        <li key={step.key} className="relative flex gap-3 pb-5 last:pb-0">
          {index < steps.length - 1 && (
            <span className="absolute top-6 left-[11px] h-[calc(100%-1.25rem)] w-px bg-border" aria-hidden="true" />
          )}
          <span
            className={cn(
              "z-10 flex size-6 shrink-0 items-center justify-center rounded-full border",
              step.state === "done" && "border-success bg-success text-white",
              step.state === "current" && "border-primary bg-primary/10 text-primary",
              step.state === "todo" && "bg-background text-muted-foreground",
              step.state === "failed" && "border-destructive bg-destructive/10 text-destructive",
            )}
            aria-hidden="true"
          >
            {step.state === "done" ? (
              <Check className="size-3.5" />
            ) : step.state === "failed" ? (
              <X className="size-3.5" />
            ) : (
              <Circle className="size-2 fill-current" />
            )}
          </span>
          <div className="min-w-0 pt-0.5">
            <p className={cn("text-sm font-medium", step.state === "todo" && "text-muted-foreground")}>
              {step.label}
              <span className="sr-only">
                {step.state === "done" ? " (done)" : step.state === "current" ? " (in progress)" : step.state === "failed" ? "" : " (not yet)"}
              </span>
            </p>
            {step.at && <p className="text-xs text-muted-foreground">{formatRelativeDate(step.at)}</p>}
            {step.state === "failed" && lead.closeReason && (
              <p className="mt-1 rounded-lg bg-muted p-2 text-sm">{lead.closeReason}</p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
