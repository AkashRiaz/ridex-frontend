import { ListingCard } from "@/components/listing/ListingCard";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { getWishlistState } from "@/service/getWishlistState";
import { searchListingsAction } from "../../_actions/searchActions";
import { HomeSectionMessage } from "./HomeSection";

const LatestListings = async () => {
  const [result, wishlist] = await Promise.all([
    searchListingsAction({ query: { limit: "8", sortBy: "newest" } }),
    getWishlistState(),
  ]);

  if (!result.success) {
    return <HomeSectionMessage>Latest listings are unavailable right now.</HomeSectionMessage>;
  }

  const listings = result.data ?? [];

  if (listings.length === 0) {
    return <HomeSectionMessage>No listings yet. Be the first to sell.</HomeSectionMessage>;
  }

  return (
    <Stagger as="ul" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {listings.map((listing) => (
        <StaggerItem as="li" key={listing.id}>
          <ListingCard
            listing={listing}
            wishlist={{ saved: wishlist.savedIds.includes(listing.id), isSignedIn: wishlist.isSignedIn }}
          />
        </StaggerItem>
      ))}
    </Stagger>
  );
};

export default LatestListings;
