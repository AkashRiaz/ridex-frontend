import { SavedSearchesPage } from "@/app/(dashboardGroup)/_components/SavedSearch/SavedSearchPages";

export const metadata = {
  title: "Saved searches",
};

const Page = (props: PageProps<"/inspector-dashboard/saved-searches">) => {
  return <SavedSearchesPage searchParams={props.searchParams} dashboardPath="/inspector-dashboard" />;
};

export default Page;
