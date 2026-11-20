import { UsersListPage } from "../../_components/User/UserPages";

export const metadata = {
  title: "Users",
};

const UsersPage = (props: PageProps<"/admin-dashboard/users">) => {
  return (
    <UsersListPage searchParams={props.searchParams} dashboardPath="/admin-dashboard" />
  );
};

export default UsersPage;
