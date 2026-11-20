import { ReviewListingPage } from "@/app/(dashboardGroup)/_components/Listing/ListingPages";

export const metadata = {
  title: "Review listing",
};

const Page = (props: PageProps<"/moderator-dashboard/listings/[listingId]">) => {
  return <ReviewListingPage params={props.params} dashboardPath="/moderator-dashboard" />;
};

export default Page;
