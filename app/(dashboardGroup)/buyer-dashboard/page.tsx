import DashboardOverviewPlaceholder from "@/components/dashboard/DashboardOverviewPlaceholder";
import StartSelling from "../_components/Listing/StartSelling";

export const metadata = {
  title: "Buyer Dashboard",
};

const BuyerDashboardPage = () => {
  return (
    <div className="space-y-2">
      <div className="mx-auto max-w-[1600px] px-2 pt-2 md:px-5 md:pt-5">
        <StartSelling />
      </div>
      <DashboardOverviewPlaceholder title="Buyer Dashboard" />
    </div>
  );
};

export default BuyerDashboardPage;
