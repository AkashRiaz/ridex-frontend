import { MyReviewsPage } from "@/app/(dashboardGroup)/_components/Review/ReviewPages";

export const metadata = {
  title: "Reviews",
};

const Page = (props: PageProps<"/seller-dashboard/reviews">) => {
  return (
    <MyReviewsPage searchParams={props.searchParams} dashboardPath="/seller-dashboard" canReceive={true} />
  );
};

export default Page;
