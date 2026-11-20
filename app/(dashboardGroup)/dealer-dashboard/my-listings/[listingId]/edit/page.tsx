import { EditListingPage } from "@/app/(dashboardGroup)/_components/Listing/ListingPages";

export const metadata = {
  title: "Edit listing",
};

const Page = (props: PageProps<"/dealer-dashboard/my-listings/[listingId]/edit">) => {
  return (
    <EditListingPage params={props.params} searchParams={props.searchParams} dashboardPath="/dealer-dashboard" />
  );
};

export default Page;
