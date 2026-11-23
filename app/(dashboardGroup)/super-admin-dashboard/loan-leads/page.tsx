import { LoanLeadsPage } from "@/app/(dashboardGroup)/_components/LoanLead/LoanLeadPages";

export const metadata = {
  title: "Loan leads",
};

const Page = (props: PageProps<"/super-admin-dashboard/loan-leads">) => {
  return <LoanLeadsPage searchParams={props.searchParams} dashboardPath="/super-admin-dashboard" />;
};

export default Page;
