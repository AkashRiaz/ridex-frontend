import { MyOffersPage } from "@/app/(dashboardGroup)/_components/Offer/OfferPages";

export const metadata = {
  title: "Offers",
};

const Page = (props: PageProps<"/buyer-dashboard/offers">) => {
  return <MyOffersPage searchParams={props.searchParams} dashboardPath="/buyer-dashboard" canSell={false} />;
};

export default Page;
