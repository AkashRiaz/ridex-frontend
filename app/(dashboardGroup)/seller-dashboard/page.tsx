import { SellerDashboardPage } from "@/app/(dashboardGroup)/_components/Dashboard/DashboardPages";

export const metadata = {
  title: "Seller Dashboard",
};

const SellerDashboardPageRoute = (props: PageProps<"/seller-dashboard">) => {
  return (
    <SellerDashboardPage
      searchParams={props.searchParams}
      dashboardPath="/seller-dashboard"
      title="Seller overview"
      description="How your listings are doing"
    />
  );
};

export default SellerDashboardPageRoute;
