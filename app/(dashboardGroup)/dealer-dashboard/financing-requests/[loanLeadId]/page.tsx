import { MyLoanLeadDetailPage } from "@/app/(dashboardGroup)/_components/LoanLead/LoanLeadPages";

export const metadata = {
  title: "Financing request",
};

const Page = (props: PageProps<"/dealer-dashboard/financing-requests/[loanLeadId]">) => {
  return <MyLoanLeadDetailPage params={props.params} dashboardPath="/dealer-dashboard" />;
};

export default Page;
