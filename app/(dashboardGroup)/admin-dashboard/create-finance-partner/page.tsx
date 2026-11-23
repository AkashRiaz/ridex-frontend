import { CreateFinancePartnerPage } from "@/app/(dashboardGroup)/_components/FinancePartner/FinancePartnerPages";

export const metadata = {
  title: "Add finance partner",
};

const Page = () => {
  return <CreateFinancePartnerPage dashboardPath="/admin-dashboard" />;
};

export default Page;
