import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Mail, Phone } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import TableBackButton from "@/components/ui/TableBackButton";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { formatRelativeDate } from "@/components/listing/ListingBits";
import { EMPLOYMENT_TYPE_LABEL, LOAN_LEAD_STATUS_DESCRIPTION } from "@/lib/enum";
import { formatCurrency } from "@/lib/formatCurrency";
import { ILoanLead, ILoanLeadAdmin, TSearchParams } from "@/types";
import { getAllFinancePartnersAction } from "../../_actions/financePartnerActions";
import { getLoanLeadByIdAction } from "../../_actions/loanLeadActions";
import { CatalogError } from "../Catalog/CatalogStates";
import LoanLeadAssign from "./LoanLeadAssign";
import {
  LoanLeadListingCell,
  LoanLeadPartnerCard,
  LoanLeadStatusBadge,
  LoanLeadTermsSummary,
  LoanLeadTimeline,
} from "./LoanLeadBits";
import LoanLeadLoadingTable from "./LoanLeadLoadingTable";
import LoanLeadStatusUpdate from "./LoanLeadStatusUpdate";
import LoanLeadTable from "./LoanLeadTable";
import LoanLeadWithdraw from "./LoanLeadWithdraw";
import MyLoanLeadTable from "./MyLoanLeadTable";

type ListPageProps = {
  searchParams?: Promise<TSearchParams>;
  dashboardPath: string;
};

type DetailPageProps = {
  params: Promise<{ loanLeadId: string }>;
  dashboardPath: string;
};

const DetailSkeleton = () => (
  <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]" aria-busy="true" aria-label="Loading request">
    <div className="space-y-4">
      <Skeleton className="h-8 w-72" />
      <Skeleton className="h-40 w-full rounded-2xl" />
      <Skeleton className="h-56 w-full rounded-2xl" />
    </div>
    <Skeleton className="h-80 w-full rounded-2xl" />
  </div>
);

const ListingLink = ({ lead }: { lead: ILoanLead }) =>
  lead.listing.isDeleted ? (
    <span className="text-xs text-muted-foreground">Listing removed</span>
  ) : (
    <Link
      href={`/listings/${lead.listing.slug}`}
      className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
    >
      <ExternalLink className="size-3.5" aria-hidden="true" /> View listing
    </Link>
  );

// ============================================
// Buyer: my financing requests
// ============================================

export const MyLoanLeadsPage = async ({ searchParams, dashboardPath }: ListPageProps) => {
  const params = await searchParams;

  return (
    <div className="space-y-4 p-2 md:p-5">
      <div>
        <h1 className="text-xl font-semibold">Financing requests</h1>
        <p className="text-sm text-muted-foreground">
          Loan requests you sent from a listing&apos;s EMI calculator, and where each one stands.
        </p>
      </div>
      <Suspense key={JSON.stringify(params ?? {})} fallback={<LoanLeadLoadingTable mine />}>
        <MyLoanLeadTable searchParams={params} dashboardPath={dashboardPath} />
      </Suspense>
    </div>
  );
};

const MyLoanLeadDetail = async ({ id }: { id: string }) => {
  const result = await getLoanLeadByIdAction(id);

  if (!result.success || !result.data) {
    if (result.statusCode === 404) notFound();
    return <CatalogError title="Failed to load this request" message={result.message} />;
  }

  const lead: ILoanLead = result.data;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0 space-y-6">
        <div className="space-y-2">
          <h1 className="flex flex-wrap items-center gap-2 text-xl font-semibold">
            <TableBackButton />
            Financing request {lead.reference}
            <LoanLeadStatusBadge status={lead.status} />
          </h1>
          <p className="text-sm text-muted-foreground">{LOAN_LEAD_STATUS_DESCRIPTION[lead.status]}</p>
        </div>

        <section className="space-y-3 rounded-2xl border bg-card p-5 shadow-card" aria-label="Listing">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <LoanLeadListingCell lead={lead} />
            <ListingLink lead={lead} />
          </div>
          <LoanLeadTermsSummary lead={lead} />
          <p className="text-xs text-muted-foreground">
            An estimate from the day you applied. The partner confirms the final rate and terms.
          </p>
        </section>

        <section className="space-y-3 rounded-2xl border bg-card p-5 shadow-card" aria-label="Your details">
          <h2 className="font-semibold">Details you shared</h2>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground">Name</dt>
              <dd>{lead.fullName}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Mobile</dt>
              <dd>{lead.phone}</dd>
            </div>
            {lead.email && (
              <div>
                <dt className="text-xs text-muted-foreground">Email</dt>
                <dd>{lead.email}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs text-muted-foreground">Employment</dt>
              <dd>
                {EMPLOYMENT_TYPE_LABEL[lead.employmentType]}
                {lead.monthlyIncome !== null && ` · ${formatCurrency(lead.monthlyIncome)} a month`}
              </dd>
            </div>
            {lead.note && (
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted-foreground">Note</dt>
                <dd className="whitespace-pre-line">{lead.note}</dd>
              </div>
            )}
          </dl>
          <p className="text-xs text-muted-foreground">
            You agreed to share these with a finance partner {formatRelativeDate(lead.consentAt).toLowerCase()}.
          </p>
        </section>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <section className="space-y-4 rounded-2xl border bg-card p-5 shadow-card" aria-label="Progress">
          <h2 className="font-semibold">Progress</h2>
          <LoanLeadTimeline lead={lead} />
          <LoanLeadPartnerCard lead={lead} />
          {lead.canWithdraw && <LoanLeadWithdraw id={lead.id} sentToPartner={lead.status === "SENT_TO_PARTNER"} />}
        </section>
      </aside>
    </div>
  );
};

export const MyLoanLeadDetailPage = async ({ params }: DetailPageProps) => {
  const { loanLeadId } = await params;

  return (
    <div className="mx-auto max-w-6xl p-2 md:p-5">
      <Suspense fallback={<DetailSkeleton />}>
        <MyLoanLeadDetail id={loanLeadId} />
      </Suspense>
    </div>
  );
};

// ============================================
// Admin: loan leads
// ============================================

export const LoanLeadsPage = async ({ searchParams, dashboardPath }: ListPageProps) => {
  const params = await searchParams;

  return (
    <div className="space-y-4 p-2 md:p-5">
      <div>
        <h1 className="text-xl font-semibold">Loan leads</h1>
        <p className="text-sm text-muted-foreground">
          Financing requests from buyers. Send each one to a finance partner and record the outcome.
        </p>
      </div>
      <Suspense key={JSON.stringify(params ?? {})} fallback={<LoanLeadLoadingTable />}>
        <LoanLeadTable searchParams={params} dashboardPath={dashboardPath} />
      </Suspense>
    </div>
  );
};

const LoanLeadDetail = async ({ id, dashboardPath }: { id: string; dashboardPath: string }) => {
  const [result, partnersResult] = await Promise.all([
    getLoanLeadByIdAction(id),
    getAllFinancePartnersAction({ query: { limit: "100", isActive: "true" } }),
  ]);

  if (!result.success || !result.data) {
    if (result.statusCode === 404) notFound();
    return <CatalogError title="Failed to load this loan lead" message={result.message} />;
  }

  const lead: ILoanLeadAdmin = result.data;
  const canAssign = lead.status === "NEW" || lead.status === "SENT_TO_PARTNER";

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="min-w-0 space-y-6">
        <div className="space-y-1">
          <h1 className="flex flex-wrap items-center gap-2 text-xl font-semibold">
            <TableBackButton />
            Loan lead {lead.reference}
            <LoanLeadStatusBadge status={lead.status} />
          </h1>
          <p className="text-sm text-muted-foreground">Received {formatRelativeDate(lead.createdAt).toLowerCase()}</p>
        </div>

        <section className="space-y-4 rounded-2xl border bg-card p-5 shadow-card" aria-label="Applicant">
          <h2 className="font-semibold">Applicant</h2>
          <div className="flex flex-wrap items-center gap-3">
            <UserAvatar name={lead.buyer.name} imageUrl={lead.buyer.imageUrl} size={40} />
            <div className="min-w-0">
              <p className="font-medium">{lead.fullName}</p>
              <p className="text-xs text-muted-foreground">
                Account: {lead.buyer.name}
                {lead.buyer.email && ` · ${lead.buyer.email}`}
              </p>
            </div>
          </div>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground">Mobile</dt>
              <dd>
                <a href={`tel:${lead.phone}`} className="inline-flex items-center gap-1 hover:underline">
                  <Phone className="size-3.5" aria-hidden="true" /> {lead.phone}
                </a>
              </dd>
            </div>
            {lead.email && (
              <div>
                <dt className="text-xs text-muted-foreground">Email</dt>
                <dd>
                  <a href={`mailto:${lead.email}`} className="inline-flex items-center gap-1 hover:underline">
                    <Mail className="size-3.5" aria-hidden="true" /> {lead.email}
                  </a>
                </dd>
              </div>
            )}
            <div>
              <dt className="text-xs text-muted-foreground">Employment</dt>
              <dd>{EMPLOYMENT_TYPE_LABEL[lead.employmentType]}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Monthly income</dt>
              <dd>{lead.monthlyIncome !== null ? formatCurrency(lead.monthlyIncome) : "Not given"}</dd>
            </div>
            {lead.district && (
              <div>
                <dt className="text-xs text-muted-foreground">District</dt>
                <dd>{lead.district}</dd>
              </div>
            )}
            {lead.note && (
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted-foreground">Note from the buyer</dt>
                <dd className="whitespace-pre-line">{lead.note}</dd>
              </div>
            )}
          </dl>
          <p className="text-xs text-muted-foreground">
            Consent to share with a finance partner given {formatRelativeDate(lead.consentAt).toLowerCase()}.
          </p>
        </section>

        <section className="space-y-3 rounded-2xl border bg-card p-5 shadow-card" aria-label="Listing and terms">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <LoanLeadListingCell lead={lead} />
            <ListingLink lead={lead} />
          </div>
          <LoanLeadTermsSummary lead={lead} />
        </section>

        {lead.adminNote && (
          <section className="space-y-1 rounded-2xl border bg-card p-5 shadow-card" aria-label="Internal note">
            <h2 className="font-semibold">Internal note</h2>
            <p className="whitespace-pre-line text-sm">{lead.adminNote}</p>
          </section>
        )}
      </div>

      <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <section className="space-y-4 rounded-2xl border bg-card p-5 shadow-card" aria-label="Progress">
          <h2 className="font-semibold">Progress</h2>
          <LoanLeadTimeline lead={lead} />
          <LoanLeadPartnerCard lead={lead} />
          {lead.partnerContact && (
            <p className="text-xs text-muted-foreground">
              Partner contact: {lead.partnerContact.contactEmail}
              {lead.partnerContact.contactPhone && ` · ${lead.partnerContact.contactPhone}`}
            </p>
          )}
        </section>

        {canAssign && (
          <LoanLeadAssign lead={lead} partners={partnersResult.data ?? []} dashboardPath={dashboardPath} />
        )}
        <LoanLeadStatusUpdate lead={lead} />
      </aside>
    </div>
  );
};

export const LoanLeadDetailPage = async ({ params, dashboardPath }: DetailPageProps) => {
  const { loanLeadId } = await params;

  return (
    <div className="mx-auto max-w-6xl p-2 md:p-5">
      <Suspense fallback={<DetailSkeleton />}>
        <LoanLeadDetail id={loanLeadId} dashboardPath={dashboardPath} />
      </Suspense>
    </div>
  );
};
