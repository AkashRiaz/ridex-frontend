import { UserDetailsPage } from "../../../_components/User/UserPages";

export const metadata = {
  title: "User details",
};

const UserDetailPage = (props: PageProps<"/super-admin-dashboard/users/[userId]">) => {
  return <UserDetailsPage params={props.params} dashboardPath="/super-admin-dashboard" />;
};

export default UserDetailPage;
