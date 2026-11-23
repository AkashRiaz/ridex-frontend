import { FinancePartnersListPage } from "@/app/(dashboardGroup)/_components/FinancePartner/FinancePartnerPages";

export const metadata = {
  title: "Finance partners",
};

const Page = (props: PageProps<"/admin-dashboard/finance-partners">) => {
  return <FinancePartnersListPage searchParams={props.searchParams} dashboardPath="/admin-dashboard" />;
};

export default Page;
