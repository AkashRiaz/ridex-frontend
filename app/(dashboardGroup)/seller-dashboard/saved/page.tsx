import { SavedListingsPage } from "@/app/(dashboardGroup)/_components/Engagement/EngagementPages";

export const metadata = {
  title: "Saved listings",
};

const Page = (props: PageProps<"/seller-dashboard/saved">) => {
  return <SavedListingsPage searchParams={props.searchParams} />;
};

export default Page;
