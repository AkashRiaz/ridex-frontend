import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Eye, Plus } from "lucide-react";
import { CustomPagination } from "@/components/ui/CustomPagination";
import { Skeleton } from "@/components/ui/skeleton";
import TableBackButton from "@/components/ui/TableBackButton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListingCard, ListingCardSkeleton } from "@/components/listing/ListingCard";
import { ListingStatusBadge, formatRelativeDate } from "@/components/listing/ListingBits";
import { PriceInsightSkeleton } from "@/components/listing/PriceInsight";
import { PriceInsightPanel } from "@/components/listing/PriceInsightPanel";
import { LISTING_STATUS_LABEL } from "@/lib/enum";
import { formatCurrency } from "@/lib/formatCurrency";
import { getMe } from "@/service/getMe";
import { TListingStatus, TSearchParams } from "@/types";
import { ListingGallery } from "@/app/(publicGroup)/_components/ListingDetail/ListingGallery";
import {
  ListingSpecsTable,
} from "@/app/(publicGroup)/_components/ListingDetail/ListingDetailParts";
import { getAllBrandsAction } from "../../_actions/brandActions";
import { getListingForManageAction, getMyListingsAction } from "../../_actions/listingActions";
import { getAllVehicleTypesAction } from "../../_actions/vehicleTypeActions";
import { CatalogError } from "../Catalog/CatalogStates";
import ListingOwnerActions from "./ListingOwnerActions";
import ListingLoadingTable from "./ListingLoadingTable";
import ListingReviewPanel from "./ListingReviewPanel";
import ListingTable from "./ListingTable";
import ListingWizard from "./wizard/ListingWizard";

const getValue = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

const OWNER_TABS: (TListingStatus | "ALL")[] = ["ALL", "DRAFT", "PENDING", "APPROVED", "REJECTED", "EXPIRED", "SOLD"];
const tabHref = (basePath: string, status: TListingStatus | "ALL") =>
  status === "ALL" ? basePath : `${basePath}?status=${status}`;

// ============================================
// Seller / dealer: my listings
// ============================================

const MyListingsGrid = async ({
  searchParams,
  dashboardPath,
}: {
  searchParams?: TSearchParams;
  dashboardPath: string;
}) => {
  const result = await getMyListingsAction({ query: searchParams });

  if (!result.success) {
    return <CatalogError title="Failed to load your listings" message={result.message} />;
  }

  const listings = result.data ?? [];
  const counts = result.meta?.statusCounts ?? {};
  const totalAll = Object.values(counts).reduce((sum, count) => sum + (count ?? 0), 0);
  const active = (getValue(searchParams?.status) as TListingStatus | undefined) ?? "ALL";
  const basePath = `${dashboardPath}/my-listings`;

  return (
    <div className="space-y-5">
      <Tabs>
        <TabsList className="h-auto flex-wrap">
          {OWNER_TABS.map((status) => (
            <TabsTrigger key={status} href={tabHref(basePath, status)} active={active === status} replace scroll={false}>
              {status === "ALL" ? "All" : LISTING_STATUS_LABEL[status]}
              <span className="ml-1.5 text-xs text-muted-foreground">
                {status === "ALL" ? totalAll : (counts[status] ?? 0)}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {listings.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-12 text-center">
          <h2 className="text-lg font-semibold">
            {active === "ALL" ? "You have no listings yet" : `No ${LISTING_STATUS_LABEL[active as TListingStatus].toLowerCase()} listings`}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Create your first listing in a few minutes.</p>
          <Link
            href={`${dashboardPath}/create-listing`}
            className="mt-5 inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            <Plus className="size-4" aria-hidden="true" /> Create listing
          </Link>
        </div>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {listings.map((listing) => (
            <li key={listing.id} className="space-y-2">
              <ListingCard
                listing={listing}
                showStatus
                showSeller={false}
                href={listing.status === "APPROVED" || listing.status === "SOLD" ? `/listings/${listing.slug}` : `${dashboardPath}/my-listings/${listing.id}/edit`}
              />
              {listing.status === "REJECTED" && listing.rejectionReason && (
                <p className="rounded-lg bg-destructive/5 px-3 py-2 text-xs text-destructive">
                  Rejected: {listing.rejectionReason}
                </p>
              )}
              <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Eye className="size-3.5" aria-hidden="true" /> {listing.viewsCount} views
                </span>
                <ListingOwnerActions listing={listing} dashboardPath={dashboardPath} />
              </div>
            </li>
          ))}
        </ul>
      )}

      <CustomPagination
        currentPage={Math.max(1, Number(result.meta?.page ?? 1))}
        totalPages={Math.max(1, Number(result.meta?.totalPages ?? 1))}
      />
    </div>
  );
};

export const MyListingsPage = async ({
  searchParams,
  dashboardPath,
}: {
  searchParams?: Promise<TSearchParams>;
  dashboardPath: string;
}) => {
  const params = await searchParams;

  return (
    <div className="space-y-5 p-2 md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">My listings</h1>
          <p className="text-sm text-muted-foreground">Drafts, live, sold and expired listings</p>
        </div>
        <Link
          href={`${dashboardPath}/create-listing`}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          <Plus className="size-4" aria-hidden="true" /> Create listing
        </Link>
      </div>
      <Suspense
        key={JSON.stringify(params ?? {})}
        fallback={
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
              <ListingCardSkeleton key={index} />
            ))}
          </div>
        }
      >
        <MyListingsGrid searchParams={params} dashboardPath={dashboardPath} />
      </Suspense>
    </div>
  );
};

// ============================================
// Seller / dealer: wizard
// ============================================

const WizardSkeleton = () => (
  <div className="space-y-6" aria-busy="true">
    <Skeleton className="h-8 w-56" />
    <Skeleton className="h-14 w-full" />
    <Skeleton className="h-96 w-full rounded-2xl" />
  </div>
);

const ListingWizardLoader = async ({
  listingId,
  step,
  dashboardPath,
}: {
  listingId?: string;
  step?: number;
  dashboardPath: string;
}) => {
  const [listingResult, vehicleTypesResult, brandsResult] = await Promise.all([
    listingId ? getListingForManageAction(listingId) : Promise.resolve(null),
    getAllVehicleTypesAction(),
    getAllBrandsAction({ query: { limit: "100" } }),
  ]);

  if (listingResult && (!listingResult.success || !listingResult.data)) {
    if (listingResult.statusCode === 404) notFound();
    return <CatalogError title="Failed to load listing" message={listingResult.message} />;
  }

  // only the owner may edit — staff use the review page
  if (listingResult?.data && !listingResult.data.isOwner) notFound();

  if (!vehicleTypesResult.success || !brandsResult.success) {
    return (
      <CatalogError
        title="Failed to load the catalog"
        message={vehicleTypesResult.message || brandsResult.message}
      />
    );
  }

  return (
    <ListingWizard
      listing={listingResult?.data ?? undefined}
      vehicleTypes={vehicleTypesResult.data ?? []}
      brands={brandsResult.data ?? []}
      dashboardPath={dashboardPath}
      initialStep={step}
    />
  );
};

export const CreateListingPage = ({ dashboardPath }: { dashboardPath: string }) => (
  <div className="mx-auto max-w-4xl p-2 md:p-5">
    <Suspense fallback={<WizardSkeleton />}>
      <ListingWizardLoader dashboardPath={dashboardPath} />
    </Suspense>
  </div>
);

export const EditListingPage = async ({
  params,
  searchParams,
  dashboardPath,
}: {
  params: Promise<{ listingId: string }>;
  searchParams?: Promise<TSearchParams>;
  dashboardPath: string;
}) => {
  const [{ listingId }, query] = await Promise.all([params, searchParams]);
  const step = Number(getValue(query?.step) ?? 1) || 1;

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-2 md:p-5">
      {/* rated on the saved price: it updates after the price step is saved */}
      <Suspense fallback={<PriceInsightSkeleton />}>
        <PriceInsightPanel listingId={listingId} showUnrated />
      </Suspense>
      <Suspense fallback={<WizardSkeleton />}>
        <ListingWizardLoader listingId={listingId} step={step} dashboardPath={dashboardPath} />
      </Suspense>
    </div>
  );
};

// ============================================
// Staff: moderation
// ============================================

export const ManageListingsPage = async ({
  searchParams,
  dashboardPath,
}: {
  searchParams?: Promise<TSearchParams>;
  dashboardPath: string;
}) => {
  const params = await searchParams;

  return (
    <div className="space-y-4 p-2 md:p-5">
      <div>
        <h1 className="text-xl font-semibold">
          <TableBackButton />
          Listings
        </h1>
        <p className="text-sm text-muted-foreground">Review new listings and manage live ones</p>
      </div>
      <Suspense key={JSON.stringify(params ?? {})} fallback={<ListingLoadingTable />}>
        <ListingTable searchParams={params} dashboardPath={dashboardPath} />
      </Suspense>
    </div>
  );
};

const ListingReview = async ({ listingId, dashboardPath }: { listingId: string; dashboardPath: string }) => {
  const [result, me] = await Promise.all([getListingForManageAction(listingId), getMe()]);

  if (!result.success || !result.data) {
    if (result.statusCode === 404) notFound();
    return <CatalogError title="Failed to load listing" message={result.message} />;
  }

  const listing = result.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">
            <TableBackButton />
            {listing.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            by {listing.seller.name} · submitted {formatRelativeDate(listing.submittedAt ?? listing.createdAt).toLowerCase()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ListingStatusBadge status={listing.status} />
          <Link
            href={`/listings/${listing.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            Public page <ExternalLink className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          <ListingGallery images={listing.images} title={listing.title} />
          <section className="space-y-2">
            <h2 className="font-semibold">Description</h2>
            <p className="whitespace-pre-line text-sm leading-6">{listing.description || "—"}</p>
          </section>
          {listing.videoUrl && (
            <p className="text-sm">
              Video:{" "}
              <a href={listing.videoUrl} target="_blank" rel="noopener noreferrer nofollow" className="text-primary hover:underline">
                {listing.videoUrl}
              </a>
            </p>
          )}
          <section className="space-y-2">
            <h2 className="font-semibold">Specs</h2>
            <ListingSpecsTable attributes={listing.vehicleType.attributes} specs={listing.specs} />
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <ListingReviewPanel
            listing={listing}
            actorRole={me.data?.role ?? "MODERATOR"}
            listPath={`${dashboardPath}/listings`}
          />
          <dl className="grid grid-cols-2 gap-3 rounded-2xl border bg-card p-5 text-sm">
            {[
              ["Price", `${formatCurrency(listing.price)}${listing.isNegotiable ? " · negotiable" : ""}`],
              ["Year", String(listing.year)],
              ["Mileage", `${listing.mileage.toLocaleString()} km`],
              ["Condition", listing.condition.toLowerCase()],
              ["Location", [listing.area, listing.district].filter(Boolean).join(", ") || "—"],
              ["Photos", String(listing.images.length)],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="font-medium first-letter:uppercase">{value}</dd>
              </div>
            ))}
          </dl>
          {/* a price far below the market is a common scam signal */}
          <Suspense fallback={<PriceInsightSkeleton />}>
            <PriceInsightPanel listingId={listing.id} showUnrated />
          </Suspense>
        </aside>
      </div>
    </div>
  );
};

export const ReviewListingPage = async ({
  params,
  dashboardPath,
}: {
  params: Promise<{ listingId: string }>;
  dashboardPath: string;
}) => {
  const { listingId } = await params;

  return (
    <div className="mx-auto max-w-6xl p-2 md:p-5">
      <Suspense fallback={<Skeleton className="h-[600px] w-full rounded-2xl" />}>
        <ListingReview listingId={listingId} dashboardPath={dashboardPath} />
      </Suspense>
    </div>
  );
};
