import { VehicleModelDetailPage } from "@/app/(dashboardGroup)/_components/Catalog/CatalogPages";

export const metadata = {
  title: "Edit model",
};

const Page = (props: PageProps<"/admin-dashboard/vehicle-models/[vehicleModelId]">) => {
  return <VehicleModelDetailPage params={props.params} dashboardPath="/admin-dashboard" />;
};

export default Page;
