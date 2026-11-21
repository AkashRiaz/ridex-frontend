import { MyTestRidesPage } from "@/app/(dashboardGroup)/_components/TestRide/TestRidePages";

export const metadata = {
  title: "Test rides",
};

const Page = (props: PageProps<"/buyer-dashboard/test-rides">) => {
  return <MyTestRidesPage searchParams={props.searchParams} dashboardPath="/buyer-dashboard" canSell={false} />;
};

export default Page;
