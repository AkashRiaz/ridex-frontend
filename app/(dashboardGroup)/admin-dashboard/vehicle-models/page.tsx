import { VehicleModelsListPage } from "@/app/(dashboardGroup)/_components/Catalog/CatalogPages";

export const metadata = {
  title: "Models",
};

const Page = (props: PageProps<"/admin-dashboard/vehicle-models">) => {
  return <VehicleModelsListPage searchParams={props.searchParams} dashboardPath="/admin-dashboard" />;
};

export default Page;
