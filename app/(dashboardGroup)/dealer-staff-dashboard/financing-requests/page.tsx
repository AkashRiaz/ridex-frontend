import { MyLoanLeadsPage } from "@/app/(dashboardGroup)/_components/LoanLead/LoanLeadPages";

export const metadata = {
  title: "Financing requests",
};

const Page = (props: PageProps<"/dealer-staff-dashboard/financing-requests">) => {
  return <MyLoanLeadsPage searchParams={props.searchParams} dashboardPath="/dealer-staff-dashboard" />;
};

export default Page;
