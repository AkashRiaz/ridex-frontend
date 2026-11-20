import { UserDetailsPage } from "../../../_components/User/UserPages";

export const metadata = {
  title: "User details",
};

const UserDetailPage = (props: PageProps<"/moderator-dashboard/users/[userId]">) => {
  return <UserDetailsPage params={props.params} dashboardPath="/moderator-dashboard" />;
};

export default UserDetailPage;
