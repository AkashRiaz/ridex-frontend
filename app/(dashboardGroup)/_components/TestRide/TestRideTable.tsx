import Link from "next/link";
import { MapPin, MessageCircle } from "lucide-react";
import { TestRideActions } from "@/components/testRide/TestRideActions";
import { TestRideStatusBadge } from "@/components/testRide/TestRideStatusBadge";
import { CustomPagination } from "@/components/ui/CustomPagination";
import { SearchBar } from "@/components/ui/SearchBar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UrlFilterSelect } from "@/components/shared/UrlFilterSelect";
import { TEST_RIDE_STATUS_LABEL } from "@/lib/enum";
import { formatRideDateTime } from "@/lib/formatRideTime";
import { TSearchParams, TTestRideStatus } from "@/types";
import { getMyTestRidesAction } from "../../_actions/testRideActions";
import { CatalogError } from "../Catalog/CatalogStates";
import { CatalogThumb } from "../Catalog/CatalogThumb";

export const TEST_RIDE_COLUMNS = ["When", "Listing", "With", "Status", "Notes", "Action"];

const STATUS_OPTIONS = (Object.keys(TEST_RIDE_STATUS_LABEL) as TTestRideStatus[]).map((status) => ({
  value: status,
  label: TEST_RIDE_STATUS_LABEL[status],
}));

const TestRideTable = async ({
  searchParams,
  dashboardPath,
  upcoming,
  canSell,
}: {
  searchParams?: TSearchParams;
  dashboardPath: string;
  upcoming: boolean;
  canSell: boolean;
}) => {
  const result = await getMyTestRidesAction({
    query: { ...searchParams, upcoming: upcoming ? "true" : "false" },
  });

  if (!result.success) {
    return <CatalogError title="Failed to load test rides" message={result.message} />;
  }

  const rides = result.data ?? [];
  const totalPages = Math.max(1, Number(result.meta?.totalPages ?? 1));

  return (
    <div className="min-w-0 overflow-hidden">
      <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {result.meta?.total ?? rides.length} {upcoming ? "upcoming" : "past"} test ride(s)
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {canSell && (
            <UrlFilterSelect
              param="as"
              label="Filter by side"
              allLabel="Buying & selling"
              options={[
                { value: "seller", label: "On my listings" },
                { value: "buyer", label: "Booked by me" },
              ]}
            />
          )}
          {!upcoming && (
            <UrlFilterSelect param="status" label="Filter by status" allLabel="All statuses" options={STATUS_OPTIONS} />
          )}
          <SearchBar compact />
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table className="min-w-[860px]">
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              {TEST_RIDE_COLUMNS.map((column) => (
                <TableHead key={column} className={column === "Action" ? "text-right font-semibold" : "font-semibold"}>
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {rides.length === 0 ? (
              <TableRow>
                <TableCell colSpan={TEST_RIDE_COLUMNS.length} className="h-28 text-center text-muted-foreground">
                  {upcoming
                    ? "No upcoming test rides. Buyers book them from a listing page or the chat."
                    : "No past test rides yet."}
                </TableCell>
              </TableRow>
            ) : (
              rides.map((ride) => {
                const counterpart = ride.side === "buyer" ? ride.seller : ride.buyer;
                const note =
                  ride.status === "DECLINED"
                    ? ride.declineReason
                    : ride.status === "CANCELLED"
                      ? ride.cancelReason
                      : ride.status === "CONFIRMED"
                        ? ride.sellerNote || ride.buyerNote
                        : ride.buyerNote;

                return (
                  <TableRow key={ride.id}>
                    <TableCell className="whitespace-nowrap font-medium">{formatRideDateTime(ride.startsAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <CatalogThumb name={ride.listing.title} imageUrl={ride.listing.coverImage} />
                        <div className="min-w-0">
                          <Link href={`/listings/${ride.listing.slug}`} className="line-clamp-1 font-medium hover:underline">
                            {ride.listing.title}
                          </Link>
                          <p className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="size-3" aria-hidden="true" />
                            {[ride.listing.area, ride.listing.district].filter(Boolean).join(", ")}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {counterpart.name}
                      <p className="text-xs text-muted-foreground">{ride.side === "buyer" ? "Seller" : "Buyer"}</p>
                    </TableCell>
                    <TableCell>
                      <TestRideStatusBadge status={ride.status} />
                    </TableCell>
                    <TableCell className="max-w-56 text-sm text-muted-foreground">
                      <span className="line-clamp-2">{note || "—"}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <TestRideActions ride={ride} actions={ride.allowedActions} refreshOnChange />
                        <Link
                          href={`${dashboardPath}/messages/${ride.conversationId}`}
                          className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium text-primary hover:bg-primary/5"
                        >
                          <MessageCircle className="size-3.5" aria-hidden="true" /> Chat
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="pt-4">
          <CustomPagination currentPage={Math.max(1, Number(result.meta?.page ?? 1))} totalPages={totalPages} />
        </div>
      )}
    </div>
  );
};

export default TestRideTable;
