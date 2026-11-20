import { BrandsListPage } from "@/app/(dashboardGroup)/_components/Catalog/CatalogPages";

export const metadata = {
  title: "Brands",
};

const Page = (props: PageProps<"/admin-dashboard/brands">) => {
  return <BrandsListPage searchParams={props.searchParams} dashboardPath="/admin-dashboard" />;
};

export default Page;
