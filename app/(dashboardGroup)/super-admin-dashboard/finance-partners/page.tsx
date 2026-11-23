import { FinancePartnersListPage } from "@/app/(dashboardGroup)/_components/FinancePartner/FinancePartnerPages";

export const metadata = {
  title: "Finance partners",
};

const Page = (props: PageProps<"/super-admin-dashboard/finance-partners">) => {
  return <FinancePartnersListPage searchParams={props.searchParams} dashboardPath="/super-admin-dashboard" />;
};

export default Page;
