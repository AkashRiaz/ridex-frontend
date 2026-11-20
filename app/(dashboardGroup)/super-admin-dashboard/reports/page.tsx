import { ManageReportsPage } from "@/app/(dashboardGroup)/_components/Report/ReportPages";

export const metadata = {
  title: "Reports",
};

const Page = (props: PageProps<"/super-admin-dashboard/reports">) => {
  return <ManageReportsPage searchParams={props.searchParams} dashboardPath="/super-admin-dashboard" />;
};

export default Page;
