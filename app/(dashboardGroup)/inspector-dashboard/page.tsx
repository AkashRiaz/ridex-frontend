import { BuyerDashboardPage } from "@/app/(dashboardGroup)/_components/Dashboard/DashboardPages";

export const metadata = {
  title: "Inspector Dashboard",
};

const InspectorDashboardPageRoute = (props: PageProps<"/inspector-dashboard">) => {
  return (
    <BuyerDashboardPage
      searchParams={props.searchParams}
      dashboardPath="/inspector-dashboard"
      title="Overview"
      description="Your chats, saved bikes and activity. Inspection requests arrive in a later phase."
    />
  );
};

export default InspectorDashboardPageRoute;
