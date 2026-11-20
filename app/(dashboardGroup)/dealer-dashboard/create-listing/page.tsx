import { CreateListingPage } from "@/app/(dashboardGroup)/_components/Listing/ListingPages";

export const metadata = {
  title: "Create listing",
};

const Page = () => {
  return <CreateListingPage dashboardPath="/dealer-dashboard" />;
};

export default Page;
