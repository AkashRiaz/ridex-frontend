import { MyListingsPage } from "@/app/(dashboardGroup)/_components/Listing/ListingPages";

export const metadata = {
  title: "My listings",
};

const Page = (props: PageProps<"/seller-dashboard/my-listings">) => {
  return <MyListingsPage searchParams={props.searchParams} dashboardPath="/seller-dashboard" />;
};

export default Page;
