import { MyLoanLeadDetailPage } from "@/app/(dashboardGroup)/_components/LoanLead/LoanLeadPages";

export const metadata = {
  title: "Financing request",
};

const Page = (props: PageProps<"/dealer-staff-dashboard/financing-requests/[loanLeadId]">) => {
  return <MyLoanLeadDetailPage params={props.params} dashboardPath="/dealer-staff-dashboard" />;
};

export default Page;
