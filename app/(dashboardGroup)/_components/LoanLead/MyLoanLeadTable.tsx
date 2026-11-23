import Link from "next/link";
import { CustomPagination } from "@/components/ui/CustomPagination";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatRelativeDate } from "@/components/listing/ListingBits";
import { formatCurrency } from "@/lib/formatCurrency";
import { TSearchParams } from "@/types";
import { getMyLoanLeadsAction } from "../../_actions/loanLeadActions";
import { CatalogError } from "../Catalog/CatalogStates";
import { LoanLeadListingCell, LoanLeadStatusBadge } from "./LoanLeadBits";

export const MY_LOAN_LEAD_COLUMNS = ["Listing", "Loan", "Monthly EMI", "Status", "Sent", "Action"];

const TABS = [
  { value: "", label: "All" },
  { value: "OPEN", label: "Open" },
  { value: "CLOSED_ALL", label: "Closed" },
];

const getValue = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

const MyLoanLeadTable = async ({
  searchParams,
  dashboardPath,
}: {
  searchParams?: TSearchParams;
  dashboardPath: string;
}) => {
  const result = await getMyLoanLeadsAction({ query: searchParams });

  if (!result.success) {
    return <CatalogError title="Failed to load your financing requests" message={result.message} />;
  }

  const leads = result.data ?? [];
  const active = getValue(searchParams?.status) ?? "";
  const basePath = `${dashboardPath}/financing-requests`;

  return (
    <div className="min-w-0 space-y-4 overflow-hidden">
      <Tabs>
        <TabsList>
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab.label}
              href={tab.value ? `${basePath}?status=${tab.value}` : basePath}
              active={active === tab.value}
              replace
              scroll={false}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="overflow-x-auto">
        <Table className="min-w-[720px]">
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              {MY_LOAN_LEAD_COLUMNS.map((column) => (
                <TableHead key={column} className={column === "Action" ? "text-right font-semibold" : "font-semibold"}>
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={MY_LOAN_LEAD_COLUMNS.length} className="h-32 text-center text-muted-foreground">
                  {active ? (
                    "No financing requests here."
                  ) : (
                    <span className="space-y-2">
                      <span className="block">No financing requests yet.</span>
                      <span className="block text-xs">
                        Open a{" "}
                        <Link href="/listings" className="font-medium text-primary hover:underline">
                          listing
                        </Link>
                        , check the EMI calculator and tap “Apply for financing”.
                      </span>
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="max-w-xs">
                    <LoanLeadListingCell lead={lead} href={`${basePath}/${lead.id}`} />
                  </TableCell>
                  <TableCell className="text-sm tabular-nums">
                    {formatCurrency(lead.loanAmount)}
                    <span className="block text-xs text-muted-foreground">{lead.tenureMonths} months</span>
                  </TableCell>
                  <TableCell className="text-sm font-medium tabular-nums">{formatCurrency(lead.estimatedEmi)}</TableCell>
                  <TableCell>
                    <LoanLeadStatusBadge status={lead.status} />
                    {lead.partner && <p className="mt-1 text-xs text-muted-foreground">{lead.partner.name}</p>}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatRelativeDate(lead.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`${basePath}/${lead.id}`}
                      className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm font-medium transition hover:bg-muted"
                    >
                      View
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CustomPagination
        currentPage={Math.max(1, Number(result.meta?.page ?? 1))}
        totalPages={Math.max(1, Number(result.meta?.totalPages ?? 1))}
      />
    </div>
  );
};

export default MyLoanLeadTable;
