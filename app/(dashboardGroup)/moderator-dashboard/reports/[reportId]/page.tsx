import { ReportDetailPage } from "@/app/(dashboardGroup)/_components/Report/ReportPages";

export const metadata = {
  title: "Report",
};

const Page = (props: PageProps<"/moderator-dashboard/reports/[reportId]">) => {
  return <ReportDetailPage params={props.params} dashboardPath="/moderator-dashboard" />;
};

export default Page;
