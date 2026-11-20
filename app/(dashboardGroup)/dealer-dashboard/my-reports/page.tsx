import { MyReportsPage } from "@/app/(dashboardGroup)/_components/Report/ReportPages";

export const metadata = {
  title: "My reports",
};

const Page = (props: PageProps<"/dealer-dashboard/my-reports">) => {
  return <MyReportsPage searchParams={props.searchParams} />;
};

export default Page;
