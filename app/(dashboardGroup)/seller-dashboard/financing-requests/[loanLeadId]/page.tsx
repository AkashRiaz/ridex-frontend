import { MyLoanLeadDetailPage } from "@/app/(dashboardGroup)/_components/LoanLead/LoanLeadPages";

export const metadata = {
  title: "Financing request",
};

const Page = (props: PageProps<"/seller-dashboard/financing-requests/[loanLeadId]">) => {
  return <MyLoanLeadDetailPage params={props.params} dashboardPath="/seller-dashboard" />;
};

export default Page;
