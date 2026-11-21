import { MyTestRidesPage } from "@/app/(dashboardGroup)/_components/TestRide/TestRidePages";

export const metadata = {
  title: "Test rides",
};

const Page = (props: PageProps<"/seller-dashboard/test-rides">) => {
  return <MyTestRidesPage searchParams={props.searchParams} dashboardPath="/seller-dashboard" canSell={true} />;
};

export default Page;
