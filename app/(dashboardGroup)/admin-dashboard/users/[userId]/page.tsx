import { UserDetailsPage } from "../../../_components/User/UserPages";

export const metadata = {
  title: "User details",
};

const UserDetailPage = (props: PageProps<"/admin-dashboard/users/[userId]">) => {
  return <UserDetailsPage params={props.params} dashboardPath="/admin-dashboard" />;
};

export default UserDetailPage;
