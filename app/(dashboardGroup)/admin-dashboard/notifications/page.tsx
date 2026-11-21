import { NotificationsPage } from "@/app/(dashboardGroup)/_components/Notification/NotificationPages";

export const metadata = {
  title: "Notifications",
};

const Page = (props: PageProps<"/admin-dashboard/notifications">) => {
  return <NotificationsPage searchParams={props.searchParams} />;
};

export default Page;
