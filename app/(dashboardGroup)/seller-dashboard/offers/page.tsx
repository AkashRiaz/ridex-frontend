import { MyOffersPage } from "@/app/(dashboardGroup)/_components/Offer/OfferPages";

export const metadata = {
  title: "Offers",
};

const Page = (props: PageProps<"/seller-dashboard/offers">) => {
  return <MyOffersPage searchParams={props.searchParams} dashboardPath="/seller-dashboard" canSell={true} />;
};

export default Page;
