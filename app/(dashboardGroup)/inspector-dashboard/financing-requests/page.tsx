import { MyLoanLeadsPage } from "@/app/(dashboardGroup)/_components/LoanLead/LoanLeadPages";

export const metadata = {
  title: "Financing requests",
};

const Page = (props: PageProps<"/inspector-dashboard/financing-requests">) => {
  return <MyLoanLeadsPage searchParams={props.searchParams} dashboardPath="/inspector-dashboard" />;
};

export default Page;
