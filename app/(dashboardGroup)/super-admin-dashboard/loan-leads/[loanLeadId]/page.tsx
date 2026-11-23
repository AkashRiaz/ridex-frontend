import { LoanLeadDetailPage } from "@/app/(dashboardGroup)/_components/LoanLead/LoanLeadPages";

export const metadata = {
  title: "Loan lead",
};

const Page = (props: PageProps<"/super-admin-dashboard/loan-leads/[loanLeadId]">) => {
  return <LoanLeadDetailPage params={props.params} dashboardPath="/super-admin-dashboard" />;
};

export default Page;
