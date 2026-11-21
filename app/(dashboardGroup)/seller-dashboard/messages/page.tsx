import { MessagesPage } from "@/app/(dashboardGroup)/_components/Chat/ChatPages";

export const metadata = {
  title: "Messages",
};

const Page = (props: PageProps<"/seller-dashboard/messages">) => {
  return <MessagesPage searchParams={props.searchParams} />;
};

export default Page;
