import { BuyerDashboardPage } from "@/app/(dashboardGroup)/_components/Dashboard/DashboardPages";
import StartSelling from "../_components/Listing/StartSelling";

export const metadata = {
  title: "Buyer Dashboard",
};

const BuyerDashboardPageRoute = (props: PageProps<"/buyer-dashboard">) => {
  return (
    <BuyerDashboardPage
      searchParams={props.searchParams}
      dashboardPath="/buyer-dashboard"
      title="Welcome back"
      description="Your saved bikes, chats and account"
      showTrustLinks
      banner={<StartSelling />}
    />
  );
};

export default BuyerDashboardPageRoute;
