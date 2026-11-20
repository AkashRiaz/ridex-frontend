import { EditListingPage } from "@/app/(dashboardGroup)/_components/Listing/ListingPages";

export const metadata = {
  title: "Edit listing",
};

const Page = (props: PageProps<"/seller-dashboard/my-listings/[listingId]/edit">) => {
  return (
    <EditListingPage params={props.params} searchParams={props.searchParams} dashboardPath="/seller-dashboard" />
  );
};

export default Page;
