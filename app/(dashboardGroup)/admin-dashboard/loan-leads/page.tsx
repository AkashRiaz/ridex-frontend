import { LoanLeadsPage } from "@/app/(dashboardGroup)/_components/LoanLead/LoanLeadPages";

export const metadata = {
  title: "Loan leads",
};

const Page = (props: PageProps<"/admin-dashboard/loan-leads">) => {
  return <LoanLeadsPage searchParams={props.searchParams} dashboardPath="/admin-dashboard" />;
};

export default Page;
