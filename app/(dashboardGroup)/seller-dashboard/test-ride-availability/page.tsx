import { TestRideAvailabilityPage } from "@/app/(dashboardGroup)/_components/TestRide/TestRidePages";

export const metadata = {
  title: "Test ride hours",
};

const Page = () => {
  return <TestRideAvailabilityPage dashboardPath="/seller-dashboard" />;
};

export default Page;
