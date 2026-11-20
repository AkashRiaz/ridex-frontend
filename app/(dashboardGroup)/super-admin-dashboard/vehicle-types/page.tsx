import { VehicleTypesListPage } from "@/app/(dashboardGroup)/_components/Catalog/CatalogPages";

export const metadata = {
  title: "Vehicle types",
};

const Page = (props: PageProps<"/super-admin-dashboard/vehicle-types">) => {
  return <VehicleTypesListPage searchParams={props.searchParams} dashboardPath="/super-admin-dashboard" />;
};

export default Page;
