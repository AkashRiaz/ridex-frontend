import { MyLoanLeadsPage } from "@/app/(dashboardGroup)/_components/LoanLead/LoanLeadPages";

export const metadata = {
  title: "Financing requests",
};

const Page = (props: PageProps<"/dealer-dashboard/financing-requests">) => {
  return <MyLoanLeadsPage searchParams={props.searchParams} dashboardPath="/dealer-dashboard" />;
};

export default Page;
