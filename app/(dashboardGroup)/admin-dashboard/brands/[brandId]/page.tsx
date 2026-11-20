import { BrandDetailPage } from "@/app/(dashboardGroup)/_components/Catalog/CatalogPages";

export const metadata = {
  title: "Edit brand",
};

const Page = (props: PageProps<"/admin-dashboard/brands/[brandId]">) => {
  return <BrandDetailPage params={props.params} dashboardPath="/admin-dashboard" />;
};

export default Page;
