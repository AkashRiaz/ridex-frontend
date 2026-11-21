import { MyOffersPage } from "@/app/(dashboardGroup)/_components/Offer/OfferPages";

export const metadata = {
  title: "Offers",
};

const Page = (props: PageProps<"/dealer-dashboard/offers">) => {
  return <MyOffersPage searchParams={props.searchParams} dashboardPath="/dealer-dashboard" canSell={true} />;
};

export default Page;
