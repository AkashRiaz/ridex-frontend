import Link from "next/link";
import { CustomPagination } from "@/components/ui/CustomPagination";
import { SearchBar } from "@/components/ui/SearchBar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UrlFilterSelect } from "@/components/shared/UrlFilterSelect";
import { formatRelativeDate } from "@/components/listing/ListingBits";
import { EMPLOYMENT_TYPE_LABEL, LOAN_LEAD_STATUS_LABEL } from "@/lib/enum";
import { formatCurrency } from "@/lib/formatCurrency";
import { TLoanLeadStatus, TSearchParams } from "@/types";
import { getAllFinancePartnersAction } from "../../_actions/financePartnerActions";
import { getLoanLeadsAction } from "../../_actions/loanLeadActions";
import { CatalogError } from "../Catalog/CatalogStates";
import { LoanLeadListingCell, LoanLeadStatusBadge } from "./LoanLeadBits";

/*
 * Admin loan lead queue: status tabs with counts, partner filter, search.
 */

export const LOAN_LEAD_COLUMNS = ["#", "Applicant", "Listing", "Loan / EMI", "Partner", "Status", "Received", "Action"];

const STATUS_TABS: (TLoanLeadStatus | "ALL")[] = [
  "NEW",
  "SENT_TO_PARTNER",
  "CONTACTED",
  "APPROVED",
  "DISBURSED",
  "REJECTED",
  "WITHDRAWN",
  "CLOSED",
  "ALL",
];

const getValue = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

const LoanLeadTable = async ({
  searchParams,
  dashboardPath,
}: {
  searchParams?: TSearchParams;
  dashboardPath: string;
}) => {
  const [result, partnersResult] = await Promise.all([
    getLoanLeadsAction(searchParams),
    getAllFinancePartnersAction({ query: { limit: "100" } }),
  ]);

  if (!result.success) {
    return <CatalogError title="Failed to load loan leads" message={result.message} />;
  }

  const leads = result.data ?? [];
  const counts = result.meta?.statusCounts ?? {};
  const active = (getValue(searchParams?.status) as TLoanLeadStatus | "ALL" | undefined) ?? "NEW";
  const basePath = `${dashboardPath}/loan-leads`;
  const currentPage = Math.max(1, Number(result.meta?.page ?? 1));
  const limit = Math.max(1, Number(result.meta?.limit ?? 20));
  const totalAll = Object.values(counts).reduce((sum, count) => sum + (count ?? 0), 0);

  const partnerOptions = [
    { value: "none", label: "Not assigned" },
    ...(partnersResult.data ?? []).map((partner) => ({ value: partner.id, label: partner.name })),
  ];

  return (
    <div className="min-w-0 space-y-4 overflow-hidden">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <Tabs>
          <TabsList className="h-auto flex-wrap">
            {STATUS_TABS.map((status) => (
              <TabsTrigger
                key={status}
                href={status === "NEW" ? basePath : `${basePath}?status=${status}`}
                active={active === status}
                replace
                scroll={false}
              >
                {status === "ALL" ? "All" : LOAN_LEAD_STATUS_LABEL[status]}
                <span className="ml-1.5 text-xs text-muted-foreground">
                  {status === "ALL" ? totalAll : (counts[status] ?? 0)}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="flex flex-wrap gap-2">
          <UrlFilterSelect param="partnerId" label="Filter by partner" allLabel="All partners" options={partnerOptions} />
          <SearchBar compact />
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table className="min-w-[980px]">
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              {LOAN_LEAD_COLUMNS.map((column) => (
                <TableHead key={column} className={column === "Action" ? "text-right font-semibold" : "font-semibold"}>
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={LOAN_LEAD_COLUMNS.length} className="h-24 text-center text-muted-foreground">
                  {active === "NEW" ? "No new financing requests. 🎉" : "No loan leads found."}
                </TableCell>
              </TableRow>
            ) : (
              leads.map((lead, index) => (
                <TableRow key={lead.id}>
                  <TableCell className="text-muted-foreground">{(currentPage - 1) * limit + index + 1}</TableCell>
                  <TableCell>
                    <p className="font-medium">{lead.fullName}</p>
                    <p className="text-xs text-muted-foreground">
                      {lead.phone} · {EMPLOYMENT_TYPE_LABEL[lead.employmentType]}
                    </p>
                  </TableCell>
                  <TableCell className="max-w-64">
                    <LoanLeadListingCell lead={lead} />
                  </TableCell>
                  <TableCell className="text-sm tabular-nums">
                    {formatCurrency(lead.loanAmount)}
                    <span className="block text-xs text-muted-foreground">
                      {formatCurrency(lead.estimatedEmi)} × {lead.tenureMonths}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">
                    {lead.partner?.name ?? (
                      <span className="text-muted-foreground">
                        {lead.preferredPartner ? `Wants ${lead.preferredPartner.name}` : "Not assigned"}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <LoanLeadStatusBadge status={lead.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatRelativeDate(lead.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`${basePath}/${lead.id}`}
                      className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm font-medium transition hover:bg-muted"
                    >
                      {lead.status === "NEW" ? "Review" : "Manage"}
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CustomPagination
        currentPage={currentPage}
        totalPages={Math.max(1, Number(result.meta?.totalPages ?? 1))}
      />
    </div>
  );
};

export default LoanLeadTable;
