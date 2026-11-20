import { CreateVehicleModelPage } from "@/app/(dashboardGroup)/_components/Catalog/CatalogPages";

export const metadata = {
  title: "Create model",
};

const Page = () => {
  return <CreateVehicleModelPage dashboardPath="/super-admin-dashboard" />;
};

export default Page;
