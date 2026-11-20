import { ReportDetailPage } from "@/app/(dashboardGroup)/_components/Report/ReportPages";

export const metadata = {
  title: "Report",
};

const Page = (props: PageProps<"/admin-dashboard/reports/[reportId]">) => {
  return <ReportDetailPage params={props.params} dashboardPath="/admin-dashboard" />;
};

export default Page;
