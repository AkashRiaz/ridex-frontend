import { ReviewListingPage } from "@/app/(dashboardGroup)/_components/Listing/ListingPages";

export const metadata = {
  title: "Review listing",
};

const Page = (props: PageProps<"/super-admin-dashboard/listings/[listingId]">) => {
  return <ReviewListingPage params={props.params} dashboardPath="/super-admin-dashboard" />;
};

export default Page;
