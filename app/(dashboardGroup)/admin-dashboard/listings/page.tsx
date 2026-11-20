import { ManageListingsPage } from "@/app/(dashboardGroup)/_components/Listing/ListingPages";

export const metadata = {
  title: "Listings",
};

const Page = (props: PageProps<"/admin-dashboard/listings">) => {
  return <ManageListingsPage searchParams={props.searchParams} dashboardPath="/admin-dashboard" />;
};

export default Page;
