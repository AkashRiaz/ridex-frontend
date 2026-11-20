import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CalendarDays, CircleCheck, MapPin, Tag } from "lucide-react";
import { ListingCard } from "@/components/listing/ListingCard";
import { RatingInline, SellerBadges } from "@/components/shared/SellerBadges";
import { ReportDialog } from "@/components/shared/ReportDialog";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ROLE_LABEL } from "@/lib/enum";
import { getMe } from "@/service/getMe";
import { getWishlistState } from "@/service/getWishlistState";
import { getPublicSellerProfileAction } from "../../_actions/sellerActions";
import { SellerReviews } from "../../_components/Seller/SellerReviews";

export const generateMetadata = async (props: PageProps<"/sellers/[sellerId]">): Promise<Metadata> => {
  const { sellerId } = await props.params;
  const result = await getPublicSellerProfileAction(sellerId);

  if (!result.success || !result.data) return { title: "Seller not found" };

  const seller = result.data;

  return {
    title: `${seller.name} — seller profile`,
    description: `${seller.stats.activeListings} active listings${seller.ratingCount ? ` · rated ${seller.ratingAverage.toFixed(1)}/5 by ${seller.ratingCount} buyers` : ""}.`,
    alternates: { canonical: `/sellers/${seller.id}` },
  };
};

const SellerProfilePage = async (props: PageProps<"/sellers/[sellerId]">) => {
  const [{ sellerId }, searchParams] = await Promise.all([props.params, props.searchParams]);
  const [result, me, wishlist] = await Promise.all([
    getPublicSellerProfileAction(sellerId),
    getMe(),
    getWishlistState(),
  ]);

  if (!result.success || !result.data) notFound();

  const seller = result.data;
  const viewerId = me.data?.id ?? null;
  const isSelf = viewerId === seller.id;
  const location = [seller.district, seller.division].filter(Boolean).join(", ");
  const roleLabel = seller.role === "DEALER" ? "Dealer" : seller.role === "SELLER" ? "Private seller" : ROLE_LABEL[seller.role];

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6 lg:px-8">
      <section className="flex flex-col gap-6 rounded-2xl border bg-card p-6 shadow-card md:flex-row md:items-start">
        <UserAvatar name={seller.name} imageUrl={seller.imageUrl} size={88} />
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <h1 className="text-2xl font-bold">{seller.name}</h1>
            <p className="text-sm text-muted-foreground">{roleLabel}</p>
          </div>
          <RatingInline average={seller.ratingAverage} count={seller.ratingCount} />
          <SellerBadges badges={seller.badges} />
          {seller.bio && <p className="max-w-2xl whitespace-pre-line text-sm leading-6">{seller.bio}</p>}
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <li className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-4" aria-hidden="true" />
              Member since {new Date(seller.memberSince).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
            </li>
            {location && (
              <li className="inline-flex items-center gap-1.5">
                <MapPin className="size-4" aria-hidden="true" />
                {location}
              </li>
            )}
            <li className="inline-flex items-center gap-1.5">
              <Tag className="size-4" aria-hidden="true" />
              {seller.stats.activeListings} active
            </li>
            <li className="inline-flex items-center gap-1.5">
              <CircleCheck className="size-4" aria-hidden="true" />
              {seller.stats.soldListings} sold
            </li>
          </ul>
        </div>
        {!isSelf && (
          <ReportDialog targetType="USER" targetId={seller.id} isSignedIn={Boolean(viewerId)} label="Report seller" />
        )}
      </section>

      <section aria-labelledby="seller-listings-heading" className="space-y-4">
        <h2 id="seller-listings-heading" className="text-xl font-bold">
          Listings
        </h2>
        {seller.listings.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active listings right now.</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {seller.listings.map((listing) => (
              <li key={listing.id}>
                <ListingCard
                  listing={listing}
                  showSeller={false}
                  wishlist={isSelf ? undefined : { saved: wishlist.savedIds.includes(listing.id), isSignedIn: wishlist.isSignedIn }}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="seller-reviews-heading" className="space-y-4">
        <h2 id="seller-reviews-heading" className="text-xl font-bold">
          Reviews
        </h2>
        <Suspense key={JSON.stringify(searchParams ?? {})} fallback={<Skeleton className="h-64 w-full rounded-2xl" />}>
          <SellerReviews sellerId={seller.id} searchParams={searchParams} viewerId={viewerId} />
        </Suspense>
      </section>
    </div>
  );
};

export default SellerProfilePage;
