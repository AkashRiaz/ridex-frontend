import { MyReviewsPage } from "@/app/(dashboardGroup)/_components/Review/ReviewPages";

export const metadata = {
  title: "Reviews",
};

const Page = (props: PageProps<"/buyer-dashboard/reviews">) => {
  return (
    <MyReviewsPage searchParams={props.searchParams} dashboardPath="/buyer-dashboard" canReceive={false} />
  );
};

export default Page;
