import { VehicleModelsListPage } from "@/app/(dashboardGroup)/_components/Catalog/CatalogPages";

export const metadata = {
  title: "Models",
};

const Page = (props: PageProps<"/super-admin-dashboard/vehicle-models">) => {
  return <VehicleModelsListPage searchParams={props.searchParams} dashboardPath="/super-admin-dashboard" />;
};

export default Page;
