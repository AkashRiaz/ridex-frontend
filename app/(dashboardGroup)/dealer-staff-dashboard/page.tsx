import { BuyerDashboardPage } from "@/app/(dashboardGroup)/_components/Dashboard/DashboardPages";

export const metadata = {
  title: "Dealer Staff Dashboard",
};

const DealerStaffDashboardPageRoute = (props: PageProps<"/dealer-staff-dashboard">) => {
  return (
    <BuyerDashboardPage
      searchParams={props.searchParams}
      dashboardPath="/dealer-staff-dashboard"
      title="Overview"
      description="Your chats, saved bikes and activity"
    />
  );
};

export default DealerStaffDashboardPageRoute;
