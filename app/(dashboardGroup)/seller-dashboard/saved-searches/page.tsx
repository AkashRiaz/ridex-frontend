import { SavedSearchesPage } from "@/app/(dashboardGroup)/_components/SavedSearch/SavedSearchPages";

export const metadata = {
  title: "Saved searches",
};

const Page = (props: PageProps<"/seller-dashboard/saved-searches">) => {
  return <SavedSearchesPage searchParams={props.searchParams} dashboardPath="/seller-dashboard" />;
};

export default Page;
