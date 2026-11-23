import { MyLoanLeadsPage } from "@/app/(dashboardGroup)/_components/LoanLead/LoanLeadPages";

export const metadata = {
  title: "Financing requests",
};

const Page = (props: PageProps<"/buyer-dashboard/financing-requests">) => {
  return <MyLoanLeadsPage searchParams={props.searchParams} dashboardPath="/buyer-dashboard" />;
};

export default Page;
