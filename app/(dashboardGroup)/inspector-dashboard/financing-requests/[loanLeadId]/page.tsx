import { MyLoanLeadDetailPage } from "@/app/(dashboardGroup)/_components/LoanLead/LoanLeadPages";

export const metadata = {
  title: "Financing request",
};

const Page = (props: PageProps<"/inspector-dashboard/financing-requests/[loanLeadId]">) => {
  return <MyLoanLeadDetailPage params={props.params} dashboardPath="/inspector-dashboard" />;
};

export default Page;
