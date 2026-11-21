import { ListingCard } from "@/components/listing/ListingCard";
import { getWishlistState } from "@/service/getWishlistState";
import { FeaturedCarousel } from "./FeaturedCarousel";
import { HomeSectionMessage, THomeDataPromise } from "./HomeSection";

/*
 * Featured row. Until paid boosts (Phase 2) the backend picks these by recent
 * saves, chats and views, preferring listings with photos and verified sellers.
 */
const FeaturedListings = async ({ data }: { data: THomeDataPromise }) => {
  const [result, wishlist] = await Promise.all([data, getWishlistState()]);

  if (!result.success || !result.data) {
    return <HomeSectionMessage>Featured bikes are unavailable right now.</HomeSectionMessage>;
  }

  const listings = result.data.featured;

  if (listings.length === 0) {
    return <HomeSectionMessage>No bikes are live yet. Be the first to list yours.</HomeSectionMessage>;
  }

  return (
    <FeaturedCarousel label="Featured bikes">
      {listings.map((listing, index) => (
        <ListingCard
          key={listing.id}
          listing={listing}
          priority={index < 2}
          wishlist={{ saved: wishlist.savedIds.includes(listing.id), isSignedIn: wishlist.isSignedIn }}
        />
      ))}
    </FeaturedCarousel>
  );
};

export default FeaturedListings;
