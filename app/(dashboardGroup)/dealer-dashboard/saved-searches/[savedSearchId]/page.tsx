import { SavedSearchDetailPage } from "@/app/(dashboardGroup)/_components/SavedSearch/SavedSearchPages";

export const metadata = {
  title: "Saved search",
};

const Page = (props: PageProps<"/dealer-dashboard/saved-searches/[savedSearchId]">) => {
  return <SavedSearchDetailPage params={props.params} dashboardPath="/dealer-dashboard" />;
};

export default Page;
