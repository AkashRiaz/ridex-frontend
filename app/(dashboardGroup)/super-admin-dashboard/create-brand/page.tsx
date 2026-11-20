import { CreateBrandPage } from "@/app/(dashboardGroup)/_components/Catalog/CatalogPages";

export const metadata = {
  title: "Create brand",
};

const Page = () => {
  return <CreateBrandPage dashboardPath="/super-admin-dashboard" />;
};

export default Page;
