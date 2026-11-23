import { MyLoanLeadsPage } from "@/app/(dashboardGroup)/_components/LoanLead/LoanLeadPages";

export const metadata = {
  title: "Financing requests",
};

const Page = (props: PageProps<"/seller-dashboard/financing-requests">) => {
  return <MyLoanLeadsPage searchParams={props.searchParams} dashboardPath="/seller-dashboard" />;
};

export default Page;
