import { BrandDetailPage } from "@/app/(dashboardGroup)/_components/Catalog/CatalogPages";

export const metadata = {
  title: "Edit brand",
};

const Page = (props: PageProps<"/super-admin-dashboard/brands/[brandId]">) => {
  return <BrandDetailPage params={props.params} dashboardPath="/super-admin-dashboard" />;
};

export default Page;
