import { VehicleModelDetailPage } from "@/app/(dashboardGroup)/_components/Catalog/CatalogPages";

export const metadata = {
  title: "Edit model",
};

const Page = (props: PageProps<"/super-admin-dashboard/vehicle-models/[vehicleModelId]">) => {
  return <VehicleModelDetailPage params={props.params} dashboardPath="/super-admin-dashboard" />;
};

export default Page;
