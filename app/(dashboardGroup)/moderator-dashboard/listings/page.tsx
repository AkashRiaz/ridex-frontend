import { ManageListingsPage } from "@/app/(dashboardGroup)/_components/Listing/ListingPages";

export const metadata = {
  title: "Listings",
};

const Page = (props: PageProps<"/moderator-dashboard/listings">) => {
  return <ManageListingsPage searchParams={props.searchParams} dashboardPath="/moderator-dashboard" />;
};

export default Page;
