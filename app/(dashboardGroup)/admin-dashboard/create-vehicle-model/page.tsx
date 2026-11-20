import { CreateVehicleModelPage } from "@/app/(dashboardGroup)/_components/Catalog/CatalogPages";

export const metadata = {
  title: "Create model",
};

const Page = () => {
  return <CreateVehicleModelPage dashboardPath="/admin-dashboard" />;
};

export default Page;
