import { UsersListPage } from "../../_components/User/UserPages";

export const metadata = {
  title: "Users",
};

const UsersPage = (props: PageProps<"/super-admin-dashboard/users">) => {
  return (
    <UsersListPage searchParams={props.searchParams} dashboardPath="/super-admin-dashboard" />
  );
};

export default UsersPage;
