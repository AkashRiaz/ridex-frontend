import { BlockedUsersPage } from "@/app/(dashboardGroup)/_components/Chat/BlockedUsersPage";

export const metadata = {
  title: "Blocked users",
};

const Page = (props: PageProps<"/dealer-dashboard/blocked-users">) => {
  return <BlockedUsersPage searchParams={props.searchParams} />;
};

export default Page;
