import Link from "next/link";
import { CustomPagination } from "@/components/ui/CustomPagination";
import { SearchBar } from "@/components/ui/SearchBar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ListingStatusBadge, formatRelativeDate } from "@/components/listing/ListingBits";
import { LISTING_STATUS_LABEL } from "@/lib/enum";
import { formatCurrency } from "@/lib/formatCurrency";
import { TListingStatus, TSearchParams } from "@/types";
import { getManagedListingsAction } from "../../_actions/listingActions";
import { CatalogError } from "../Catalog/CatalogStates";
import { CatalogThumb } from "../Catalog/CatalogThumb";

/*
 * Staff moderation queue: status tabs with counts, search, table, pagination.
 */

const getValue = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

const STAFF_TABS: (TListingStatus | "ALL")[] = ["PENDING", "APPROVED", "REJECTED", "EXPIRED", "SOLD", "ALL"];

const ListingTable = async ({
  searchParams,
  dashboardPath,
}: {
  searchParams?: TSearchParams;
  dashboardPath: string;
}) => {
  const query = { status: "PENDING", ...searchParams };
  if (getValue(searchParams?.status) === "ALL") delete (query as Record<string, unknown>).status;

  const result = await getManagedListingsAction({ query });

  if (!result.success) {
    return <CatalogError title="Failed to load listings" message={result.message} />;
  }

  const listings = result.data ?? [];
  const counts = result.meta?.statusCounts ?? {};
  const active = (getValue(searchParams?.status) as TListingStatus | "ALL" | undefined) ?? "PENDING";
  const basePath = `${dashboardPath}/listings`;
  const currentPage = Math.max(1, Number(result.meta?.page ?? 1));
  const limit = Math.max(1, Number(result.meta?.limit ?? 20));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs>
          <TabsList className="h-auto flex-wrap">
            {STAFF_TABS.map((status) => (
              <TabsTrigger
                key={status}
                href={status === "PENDING" ? basePath : `${basePath}?status=${status}`}
                active={active === status}
                replace
                scroll={false}
              >
                {status === "ALL" ? "All" : LISTING_STATUS_LABEL[status]}
                {status !== "ALL" && (
                  <span className="ml-1.5 text-xs text-muted-foreground">{counts[status] ?? 0}</span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <SearchBar compact />
      </div>

      <div className="overflow-x-auto">
        <Table className="min-w-[860px]">
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              {["#", "Listing", "Seller", "Price", "Status", active === "PENDING" ? "Waiting since" : "Updated", "Action"].map((column) => (
                <TableHead key={column} className={column === "Action" ? "text-right font-semibold" : "font-semibold"}>
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {listings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  {active === "PENDING" ? "The review queue is empty. 🎉" : "No listings found."}
                </TableCell>
              </TableRow>
            ) : (
              listings.map((listing, index) => (
                <TableRow key={listing.id}>
                  <TableCell className="text-muted-foreground">{(currentPage - 1) * limit + index + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <CatalogThumb name={listing.brand.name} imageUrl={listing.coverImageUrl} size={44} />
                      <div className="min-w-0">
                        <p className="max-w-xs truncate font-medium">{listing.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {listing.district || "No location"} · {listing.imageCount} photo{listing.imageCount === 1 ? "" : "s"}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    <p>{listing.seller?.name}</p>
                    <p className="text-xs text-muted-foreground">{listing.seller?.email}</p>
                  </TableCell>
                  <TableCell className="text-sm font-medium">{formatCurrency(listing.price)}</TableCell>
                  <TableCell>
                    <ListingStatusBadge status={listing.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatRelativeDate(active === "PENDING" ? listing.submittedAt : listing.updatedAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`${basePath}/${listing.id}`}
                      className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm font-medium transition hover:bg-muted"
                    >
                      Review
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CustomPagination currentPage={currentPage} totalPages={Math.max(1, Number(result.meta?.totalPages ?? 1))} />
    </div>
  );
};

export default ListingTable;
