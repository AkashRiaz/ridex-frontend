import { ManageListingsPage } from "@/app/(dashboardGroup)/_components/Listing/ListingPages";

export const metadata = {
  title: "Listings",
};

const Page = (props: PageProps<"/super-admin-dashboard/listings">) => {
  return <ManageListingsPage searchParams={props.searchParams} dashboardPath="/super-admin-dashboard" />;
};

export default Page;
