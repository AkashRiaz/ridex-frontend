import { MessagesPage } from "@/app/(dashboardGroup)/_components/Chat/ChatPages";

export const metadata = {
  title: "Conversation",
};

const Page = async (props: PageProps<"/inspector-dashboard/messages/[conversationId]">) => {
  const { conversationId } = await props.params;

  return <MessagesPage searchParams={props.searchParams} conversationId={conversationId} />;
};

export default Page;
