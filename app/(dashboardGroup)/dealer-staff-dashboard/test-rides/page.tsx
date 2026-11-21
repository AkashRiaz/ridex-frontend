import { MyTestRidesPage } from "@/app/(dashboardGroup)/_components/TestRide/TestRidePages";

export const metadata = {
  title: "Test rides",
};

const Page = (props: PageProps<"/dealer-staff-dashboard/test-rides">) => {
  return <MyTestRidesPage searchParams={props.searchParams} dashboardPath="/dealer-staff-dashboard" canSell={false} />;
};

export default Page;
