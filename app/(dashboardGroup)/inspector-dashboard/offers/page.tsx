import { MyOffersPage } from "@/app/(dashboardGroup)/_components/Offer/OfferPages";

export const metadata = {
  title: "Offers",
};

const Page = (props: PageProps<"/inspector-dashboard/offers">) => {
  return <MyOffersPage searchParams={props.searchParams} dashboardPath="/inspector-dashboard" canSell={false} />;
};

export default Page;
