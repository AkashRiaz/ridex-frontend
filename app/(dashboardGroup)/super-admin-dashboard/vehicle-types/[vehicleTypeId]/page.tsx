import { VehicleTypeDetailPage } from "@/app/(dashboardGroup)/_components/Catalog/CatalogPages";

export const metadata = {
  title: "Edit vehicle type",
};

const Page = (props: PageProps<"/super-admin-dashboard/vehicle-types/[vehicleTypeId]">) => {
  return <VehicleTypeDetailPage params={props.params} dashboardPath="/super-admin-dashboard" />;
};

export default Page;
