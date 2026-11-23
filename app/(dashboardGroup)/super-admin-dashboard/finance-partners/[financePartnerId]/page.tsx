import { FinancePartnerDetailPage } from "@/app/(dashboardGroup)/_components/FinancePartner/FinancePartnerPages";

export const metadata = {
  title: "Edit finance partner",
};

const Page = (props: PageProps<"/super-admin-dashboard/finance-partners/[financePartnerId]">) => {
  return <FinancePartnerDetailPage params={props.params} dashboardPath="/super-admin-dashboard" />;
};

export default Page;
