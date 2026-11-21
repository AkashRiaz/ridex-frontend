import { SellerDashboardPage } from "@/app/(dashboardGroup)/_components/Dashboard/DashboardPages";

export const metadata = {
  title: "Dealer Dashboard",
};

const DealerDashboardPageRoute = (props: PageProps<"/dealer-dashboard">) => {
  return (
    <SellerDashboardPage
      searchParams={props.searchParams}
      dashboardPath="/dealer-dashboard"
      title="Dealer overview"
      description="Inventory performance and buyer interest"
      isDealer
    />
  );
};

export default DealerDashboardPageRoute;
