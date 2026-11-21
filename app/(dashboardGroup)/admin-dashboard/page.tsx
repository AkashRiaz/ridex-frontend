import { AdminDashboardPage } from "@/app/(dashboardGroup)/_components/Dashboard/DashboardPages";

export const metadata = {
  title: "Admin Dashboard",
};

const AdminDashboardPageRoute = (props: PageProps<"/admin-dashboard">) => {
  return (
    <AdminDashboardPage
      searchParams={props.searchParams}
      dashboardPath="/admin-dashboard"
      title="Platform overview"
      description="Users, listings, moderation and activity"
    />
  );
};

export default AdminDashboardPageRoute;
