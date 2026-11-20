import ProfilePage from "../../_components/Profile/ProfilePage";

export const metadata = {
  title: "My Profile",
};

const MyProfilePage = (props: PageProps<"/buyer-dashboard/profile">) => {
  return <ProfilePage searchParams={props.searchParams} />;
};

export default MyProfilePage;
