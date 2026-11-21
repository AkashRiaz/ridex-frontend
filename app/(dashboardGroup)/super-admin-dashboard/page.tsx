import { AdminDashboardPage } from "@/app/(dashboardGroup)/_components/Dashboard/DashboardPages";

export const metadata = {
  title: "Super Admin Dashboard",
};

const SuperAdminDashboardPage = (props: PageProps<"/super-admin-dashboard">) => {
  return (
    <AdminDashboardPage
      searchParams={props.searchParams}
      dashboardPath="/super-admin-dashboard"
      title="Platform overview"
      description="Users, listings, moderation and activity across RideX"
      isSuperAdmin
    />
  );
};

export default SuperAdminDashboardPage;
