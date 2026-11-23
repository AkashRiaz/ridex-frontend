import Link from "next/link";
import { Pencil } from "lucide-react";
import { CustomPagination } from "@/components/ui/CustomPagination";
import { SearchBar } from "@/components/ui/SearchBar";
import TableBackButton from "@/components/ui/TableBackButton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ActiveBadge } from "@/components/shared/UserBadges";
import { ACTIVE_FILTER_OPTIONS, UrlFilterSelect } from "@/components/shared/UrlFilterSelect";
import { formatRate } from "@/lib/emi";
import { TSearchParams } from "@/types";
import { getAllFinancePartnersAction } from "../../_actions/financePartnerActions";
import { CatalogError } from "../Catalog/CatalogStates";
import { CatalogThumb } from "../Catalog/CatalogThumb";
import FinancePartnerDelete from "./FinancePartnerDelete";

export const FINANCE_PARTNER_COLUMNS = ["#", "Partner", "Lead email", "Rates", "Limits", "Open leads", "Status", "Action"];

const FinancePartnerTable = async ({
  searchParams,
  dashboardPath,
}: {
  searchParams?: TSearchParams;
  dashboardPath: string;
}) => {
  const result = await getAllFinancePartnersAction({ query: searchParams });

  if (!result.success) {
    return <CatalogError title="Failed to load finance partners" message={result.message} />;
  }

  const partners = result.data ?? [];
  const currentPage = Math.max(1, Number(result.meta?.page ?? 1));
  const limit = Math.max(1, Number(result.meta?.limit ?? 20));
  const totalPages = Math.max(1, Number(result.meta?.totalPages ?? 1));

  return (
    <div className="min-w-0 overflow-hidden">
      <div className="mx-1 flex flex-col gap-3 border-b py-4 sm:mx-2 md:mx-0 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            <TableBackButton />
            Finance partners
          </h2>
          <p className="text-sm text-muted-foreground">
            {result.meta?.total ?? partners.length} partners · banks and lenders that receive loan leads
          </p>
        </div>

        <div className="flex min-w-0 flex-wrap items-center gap-2 lg:justify-end">
          <SearchBar compact />
          <Link
            href={`${dashboardPath}/create-finance-partner`}
            className="shrink-0 rounded-md bg-primary px-4 py-2 text-sm font-medium whitespace-nowrap text-primary-foreground transition hover:bg-primary/90"
          >
            Add Partner
          </Link>
        </div>
      </div>

      <div className="mx-1 flex flex-wrap gap-2 py-3 sm:mx-2 md:mx-0">
        <UrlFilterSelect
          param="isActive"
          label="Filter by status"
          allLabel="All statuses"
          options={ACTIVE_FILTER_OPTIONS}
          className="w-36"
        />
      </div>

      <div className="mx-1 overflow-x-auto sm:mx-2 md:mx-0">
        <Table className="min-w-[900px]">
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              {FINANCE_PARTNER_COLUMNS.map((column) => (
                <TableHead key={column} className={column === "Action" ? "text-right font-semibold" : "font-semibold"}>
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {partners.length === 0 ? (
              <TableRow>
                <TableCell colSpan={FINANCE_PARTNER_COLUMNS.length} className="h-24 text-center text-muted-foreground">
                  No finance partners yet. Add one to start sending loan leads.
                </TableCell>
              </TableRow>
            ) : (
              partners.map((partner, index) => (
                <TableRow key={partner.id}>
                  <TableCell className="font-medium text-muted-foreground">{(currentPage - 1) * limit + index + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <CatalogThumb name={partner.name} imageUrl={partner.logoUrl} />
                      <div>
                        <p className="font-medium">{partner.name}</p>
                        <p className="font-mono text-xs text-muted-foreground">{partner.slug}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {partner.contactEmail}
                    {partner.contactPhone && (
                      <span className="block text-xs text-muted-foreground">{partner.contactPhone}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm tabular-nums">
                    {formatRate(partner.interestRateMin)}–{formatRate(partner.interestRateMax)}
                  </TableCell>
                  <TableCell className="text-sm">
                    From {partner.minDownPaymentPercent}% down
                    <span className="block text-xs text-muted-foreground">Up to {partner.maxTenureMonths} months</span>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`${dashboardPath}/loan-leads?status=ALL&partnerId=${partner.id}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      {partner.openLeadsCount}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <ActiveBadge isActive={partner.isActive} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`${dashboardPath}/finance-partners/${partner.id}`}
                        className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition hover:bg-muted"
                      >
                        <Pencil className="size-3.5" aria-hidden="true" />
                        Edit
                      </Link>
                      <FinancePartnerDelete id={partner.id} name={partner.name} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CustomPagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
};

export default FinancePartnerTable;
