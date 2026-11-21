import { ModeratorDashboardPage } from "@/app/(dashboardGroup)/_components/Dashboard/DashboardPages";

export const metadata = {
  title: "Moderator Dashboard",
};

const ModeratorDashboardPageRoute = (props: PageProps<"/moderator-dashboard">) => {
  return (
    <ModeratorDashboardPage
      searchParams={props.searchParams}
      dashboardPath="/moderator-dashboard"
      title="Moderation overview"
      description="Queues and your recent decisions"
    />
  );
};

export default ModeratorDashboardPageRoute;
