import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { OfferActions } from "@/components/offer/OfferActions";
import { OfferStatusBadge } from "@/components/offer/OfferStatusBadge";
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
import { OFFER_STATUS_LABEL } from "@/lib/enum";
import { formatChatTime } from "@/lib/formatChatTime";
import { formatCurrency } from "@/lib/formatCurrency";
import { formatTimeLeft } from "@/lib/formatRideTime";
import { TOfferStatus, TSearchParams } from "@/types";
import { getMyOffersAction } from "../../_actions/offerActions";
import { CatalogError } from "../Catalog/CatalogStates";
import { CatalogThumb } from "../Catalog/CatalogThumb";

export const OFFER_COLUMNS = ["Listing", "With", "Offer", "Status", "Time", "Action"];

// COUNTERED rows are hidden by default (each negotiation shows its latest offer)
const STATUS_OPTIONS = (Object.keys(OFFER_STATUS_LABEL) as TOfferStatus[])
  .filter((status) => status !== "COUNTERED")
  .map((status) => ({ value: status, label: OFFER_STATUS_LABEL[status] }));

const OfferTable = async ({
  searchParams,
  dashboardPath,
  as,
}: {
  searchParams?: TSearchParams;
  dashboardPath: string;
  as: "buyer" | "seller";
}) => {
  const result = await getMyOffersAction({ query: { ...searchParams, as } });

  if (!result.success) {
    return <CatalogError title="Failed to load offers" message={result.message} />;
  }

  const offers = result.data ?? [];
  const totalPages = Math.max(1, Number(result.meta?.totalPages ?? 1));

  return (
    <div className="min-w-0 overflow-hidden">
      <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {result.meta?.total ?? offers.length} {as === "buyer" ? "offers you made" : "offers on your listings"}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <UrlFilterSelect param="status" label="Filter by status" allLabel="All statuses" options={STATUS_OPTIONS} />
          <SearchBar compact />
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table className="min-w-[820px]">
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              {OFFER_COLUMNS.map((column) => (
                <TableHead key={column} className={column === "Action" ? "text-right font-semibold" : "font-semibold"}>
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {offers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={OFFER_COLUMNS.length} className="h-28 text-center text-muted-foreground">
                  {as === "buyer"
                    ? "No offers yet. Use “Make an offer” on a negotiable listing."
                    : "No offers on your listings yet."}
                </TableCell>
              </TableRow>
            ) : (
              offers.map((offer) => {
                const counterpart = as === "buyer" ? offer.seller : offer.buyer;
                const isOpen = offer.status === "PENDING";

                return (
                  <TableRow key={offer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <CatalogThumb name={offer.listing.title} imageUrl={offer.listing.coverImage} />
                        <div className="min-w-0">
                          <Link
                            href={`/listings/${offer.listing.slug}`}
                            className="line-clamp-1 font-medium hover:underline"
                          >
                            {offer.listing.title}
                          </Link>
                          <p className="text-xs text-muted-foreground">Asking {formatCurrency(offer.listing.price)}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{counterpart.name}</TableCell>
                    <TableCell>
                      <p className="font-semibold">{formatCurrency(offer.amount)}</p>
                      <p className="text-xs text-muted-foreground">
                        {offer.isMine ? "From you" : "From them"}
                        {offer.round > 1 && ` · round ${offer.round}`}
                      </p>
                    </TableCell>
                    <TableCell>
                      <OfferStatusBadge status={offer.status} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {isOpen ? formatTimeLeft(offer.expiresAt) : formatChatTime(offer.respondedAt ?? offer.updatedAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <OfferActions
                          offer={offer}
                          actions={offer.allowedActions}
                          side={offer.side ?? as}
                          listingTitle={offer.listing.title}
                          listingPrice={offer.listing.price}
                          refreshOnChange
                        />
                        <Link
                          href={`${dashboardPath}/messages/${offer.conversationId}`}
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

export default OfferTable;
