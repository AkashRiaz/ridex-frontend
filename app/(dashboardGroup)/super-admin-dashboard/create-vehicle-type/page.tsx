import { CreateVehicleTypePage } from "@/app/(dashboardGroup)/_components/Catalog/CatalogPages";

export const metadata = {
  title: "Create vehicle type",
};

const Page = () => {
  return <CreateVehicleTypePage dashboardPath="/super-admin-dashboard" />;
};

export default Page;
