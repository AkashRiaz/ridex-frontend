import { MyListingsPage } from "@/app/(dashboardGroup)/_components/Listing/ListingPages";

export const metadata = {
  title: "My listings",
};

const Page = (props: PageProps<"/dealer-dashboard/my-listings">) => {
  return <MyListingsPage searchParams={props.searchParams} dashboardPath="/dealer-dashboard" />;
};

export default Page;
