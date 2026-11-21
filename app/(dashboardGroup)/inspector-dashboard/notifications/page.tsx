import { NotificationsPage } from "@/app/(dashboardGroup)/_components/Notification/NotificationPages";

export const metadata = {
  title: "Notifications",
};

const Page = (props: PageProps<"/inspector-dashboard/notifications">) => {
  return <NotificationsPage searchParams={props.searchParams} />;
};

export default Page;
