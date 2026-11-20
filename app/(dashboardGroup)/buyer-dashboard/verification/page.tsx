import { MyVerificationPage } from "@/app/(dashboardGroup)/_components/Verification/VerificationPages";

export const metadata = {
  title: "Verification",
};

const Page = () => {
  return <MyVerificationPage dashboardPath="/buyer-dashboard" />;
};

export default Page;
