import { MyReviewsPage } from "@/app/(dashboardGroup)/_components/Review/ReviewPages";

export const metadata = {
  title: "Reviews",
};

const Page = (props: PageProps<"/dealer-dashboard/reviews">) => {
  return (
    <MyReviewsPage searchParams={props.searchParams} dashboardPath="/dealer-dashboard" canReceive={true} />
  );
};

export default Page;
