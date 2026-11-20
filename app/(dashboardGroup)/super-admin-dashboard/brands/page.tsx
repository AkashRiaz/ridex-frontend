import { BrandsListPage } from "@/app/(dashboardGroup)/_components/Catalog/CatalogPages";

export const metadata = {
  title: "Brands",
};

const Page = (props: PageProps<"/super-admin-dashboard/brands">) => {
  return <BrandsListPage searchParams={props.searchParams} dashboardPath="/super-admin-dashboard" />;
};

export default Page;
