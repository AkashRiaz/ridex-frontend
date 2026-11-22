import { SavedSearchesPage } from "@/app/(dashboardGroup)/_components/SavedSearch/SavedSearchPages";

export const metadata = {
  title: "Saved searches",
};

const Page = (props: PageProps<"/buyer-dashboard/saved-searches">) => {
  return <SavedSearchesPage searchParams={props.searchParams} dashboardPath="/buyer-dashboard" />;
};

export default Page;
