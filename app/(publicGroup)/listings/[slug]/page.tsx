import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AlertTriangle, Calendar, Eye, Gauge, MapPin, Palette, Pencil, Sparkles } from "lucide-react";
import { ListingCard, ListingCardSkeleton } from "@/components/listing/ListingCard";
import { WishlistButton } from "@/components/listing/WishlistButton";
import { ReportDialog } from "@/components/shared/ReportDialog";
import {
  ListingStatusBadge,
  PriceTag,
  formatMileage,
  formatRelativeDate,
} from "@/components/listing/ListingBits";
import { getDashboardPath } from "@/lib/dashboardPath";
import { LISTING_CONDITION_LABEL } from "@/lib/enum";
import { formatCurrency } from "@/lib/formatCurrency";
import { siteConfig } from "@/lib/siteConfig";
import { getMe } from "@/service/getMe";
import { getWishlistState } from "@/service/getWishlistState";
import { getListingBySlugAction, getSimilarListingsAction } from "../../_actions/searchActions";
import { ListingGallery } from "../../_components/ListingDetail/ListingGallery";
import {
  ListingSpecsTable,
  ListingVideo,
  SellerCard,
  getStatusNotice,
} from "../../_components/ListingDetail/ListingDetailParts";
import { RateSeller } from "../../_components/ListingDetail/RateSeller";
import { ShareButton } from "../../_components/ListingDetail/ShareButton";

type ListingDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export const generateMetadata = async ({ params }: ListingDetailPageProps): Promise<Metadata> => {
  const { slug } = await params;
  const result = await getListingBySlugAction(slug);

  if (!result.success || !result.data) {
    return { title: "Listing not found" };
  }

  const listing = result.data;
  const cover = listing.images.find((image) => image.isCover) ?? listing.images[0];
  const description = `${formatCurrency(listing.price)} · ${listing.year} · ${formatMileage(listing.mileage)} · ${listing.district}. ${listing.description.slice(0, 120)}`;

  return {
    title: listing.title,
    description,
    alternates: { canonical: `/listings/${listing.slug}` },
    // unapproved previews must not be indexed
    robots: listing.status === "APPROVED" ? undefined : { index: false, follow: false },
    openGraph: {
      title: `${listing.title} — ${formatCurrency(listing.price)}`,
      description,
      type: "website",
      siteName: siteConfig.name,
      url: `/listings/${listing.slug}`,
      ...(cover && { images: [{ url: cover.url, alt: listing.title }] }),
    },
  };
};

const SimilarListings = async ({ slug }: { slug: string }) => {
  const [result, wishlist] = await Promise.all([getSimilarListingsAction(slug), getWishlistState()]);
  const listings = result.data ?? [];

  if (listings.length === 0) return null;

  return (
    <section aria-labelledby="similar-heading" className="space-y-4">
      <h2 id="similar-heading" className="text-xl font-bold">
        Similar listings
      </h2>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {listings.slice(0, 4).map((listing) => (
          <li key={listing.id}>
            <ListingCard
              listing={listing}
              wishlist={{ saved: wishlist.savedIds.includes(listing.id), isSignedIn: wishlist.isSignedIn }}
            />
          </li>
        ))}
      </ul>
    </section>
  );
};

const ListingDetailPage = async ({ params }: ListingDetailPageProps) => {
  const { slug } = await params;
  const [result, me, wishlist] = await Promise.all([getListingBySlugAction(slug), getMe(), getWishlistState()]);

  if (!result.success || !result.data) notFound();

  const listing = result.data;
  const statusNotice = getStatusNotice(listing);
  const canEdit = listing.isOwner && listing.status !== "SOLD";
  const ownerDashboard = getDashboardPath(me.data?.role);
  const isSignedIn = Boolean(me.success && me.data);
  const isLive = listing.status === "APPROVED";

  const facts = [
    { icon: Calendar, label: "Model year", value: String(listing.year) },
    { icon: Gauge, label: "Mileage", value: formatMileage(listing.mileage) },
    { icon: Sparkles, label: "Condition", value: LISTING_CONDITION_LABEL[listing.condition] },
    ...(listing.color ? [{ icon: Palette, label: "Color", value: listing.color }] : []),
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-12 px-4 py-8 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/listings" className="hover:text-foreground">
              Listings
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href={`/listings?brand=${listing.brand.slug}`} className="hover:text-foreground">
              {listing.brand.name}
            </Link>
          </li>
          {listing.vehicleModel && (
            <>
              <li aria-hidden="true">/</li>
              <li>
                <Link
                  href={`/listings?brand=${listing.brand.slug}&model=${listing.vehicleModel.slug}`}
                  className="hover:text-foreground"
                >
                  {listing.vehicleModel.name}
                </Link>
              </li>
            </>
          )}
        </ol>
      </nav>

      {statusNotice && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <div className="flex flex-1 flex-wrap items-center justify-between gap-3">
            <p>{statusNotice}</p>
            <ListingStatusBadge status={listing.status} />
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-8">
          <ListingGallery images={listing.images} title={listing.title} />

          <section aria-labelledby="description-heading" className="space-y-3">
            <h2 id="description-heading" className="text-xl font-bold">
              Description
            </h2>
            {listing.description ? (
              // plain text only — never rendered as HTML
              <p className="whitespace-pre-line leading-7 text-foreground/90">{listing.description}</p>
            ) : (
              <p className="text-sm text-muted-foreground">No description provided.</p>
            )}
          </section>

          {listing.videoUrl && (
            <section aria-labelledby="video-heading" className="space-y-3">
              <h2 id="video-heading" className="text-xl font-bold">
                Video
              </h2>
              <ListingVideo url={listing.videoUrl} title={listing.title} />
            </section>
          )}

          <section aria-labelledby="specs-heading" className="space-y-3">
            <h2 id="specs-heading" className="text-xl font-bold">
              Specifications
            </h2>
            <ListingSpecsTable attributes={listing.vehicleType.attributes} specs={listing.specs} />
          </section>

          {isSignedIn && me.data && !listing.isOwner && (isLive || listing.status === "SOLD") && (
            <Suspense fallback={null}>
              <RateSeller listingId={listing.id} sellerName={listing.seller.name} viewerRole={me.data.role} />
            </Suspense>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <section className="space-y-4 rounded-2xl border bg-card p-5 shadow-card">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {listing.brand.name} · {listing.vehicleType.name}
              </p>
              <h1 className="text-2xl font-bold leading-tight">{listing.title}</h1>
            </div>

            <PriceTag price={listing.price} isNegotiable={listing.isNegotiable} size="lg" />

            <dl className="grid grid-cols-2 gap-3">
              {facts.map((fact) => (
                <div key={fact.label} className="rounded-xl bg-muted/50 p-3">
                  <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <fact.icon className="size-3.5" aria-hidden="true" />
                    {fact.label}
                  </dt>
                  <dd className="mt-1 font-semibold">{fact.value}</dd>
                </div>
              ))}
            </dl>

            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-4" aria-hidden="true" />
              {[listing.area, listing.district, listing.division].filter(Boolean).join(", ")}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Eye className="size-3.5" aria-hidden="true" />
                {listing.viewsCount.toLocaleString()} views
              </span>
              <span>Listed {formatRelativeDate(listing.approvedAt ?? listing.createdAt).toLowerCase()}</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {isLive && !listing.isOwner && (
                <WishlistButton
                  listingId={listing.id}
                  saved={wishlist.savedIds.includes(listing.id)}
                  isSignedIn={isSignedIn}
                  variant="button"
                />
              )}
              <ShareButton title={listing.title} path={`/listings/${listing.slug}`} />
              {canEdit && ownerDashboard && (
                <Link
                  href={`${ownerDashboard}/my-listings/${listing.id}/edit`}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                >
                  <Pencil className="size-4" aria-hidden="true" />
                  Edit listing
                </Link>
              )}
            </div>
          </section>

          <SellerCard
            seller={listing.seller}
            isSignedIn={isSignedIn}
            isOwner={Boolean(listing.isOwner)}
            chat={
              isLive
                ? { listingId: listing.id, listingTitle: listing.title, viewerRole: me.data?.role ?? null }
                : undefined
            }
          />

          {!listing.isOwner && (isLive || listing.status === "SOLD") && (
            <div className="flex justify-center">
              <ReportDialog targetType="LISTING" targetId={listing.id} isSignedIn={isSignedIn} label="Report this listing" />
            </div>
          )}
        </aside>
      </div>

      {listing.status === "APPROVED" && (
        <Suspense
          fallback={
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
                <ListingCardSkeleton key={index} />
              ))}
            </div>
          }
        >
          <SimilarListings slug={listing.slug} />
        </Suspense>
      )}
    </div>
  );
};

export default ListingDetailPage;
