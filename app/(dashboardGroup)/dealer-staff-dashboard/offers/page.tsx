import { MyOffersPage } from "@/app/(dashboardGroup)/_components/Offer/OfferPages";

export const metadata = {
  title: "Offers",
};

const Page = (props: PageProps<"/dealer-staff-dashboard/offers">) => {
  return <MyOffersPage searchParams={props.searchParams} dashboardPath="/dealer-staff-dashboard" canSell={false} />;
};

export default Page;
