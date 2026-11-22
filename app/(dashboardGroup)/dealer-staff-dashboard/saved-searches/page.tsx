import { SavedSearchesPage } from "@/app/(dashboardGroup)/_components/SavedSearch/SavedSearchPages";

export const metadata = {
  title: "Saved searches",
};

const Page = (props: PageProps<"/dealer-staff-dashboard/saved-searches">) => {
  return <SavedSearchesPage searchParams={props.searchParams} dashboardPath="/dealer-staff-dashboard" />;
};

export default Page;
