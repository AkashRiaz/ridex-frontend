import { LoanLeadDetailPage } from "@/app/(dashboardGroup)/_components/LoanLead/LoanLeadPages";

export const metadata = {
  title: "Loan lead",
};

const Page = (props: PageProps<"/admin-dashboard/loan-leads/[loanLeadId]">) => {
  return <LoanLeadDetailPage params={props.params} dashboardPath="/admin-dashboard" />;
};

export default Page;
