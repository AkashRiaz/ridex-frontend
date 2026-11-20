import { VerificationDetailPage } from "@/app/(dashboardGroup)/_components/Verification/VerificationPages";

export const metadata = {
  title: "Verification request",
};

const Page = (props: PageProps<"/admin-dashboard/verifications/[verificationId]">) => {
  return <VerificationDetailPage params={props.params} dashboardPath="/admin-dashboard" />;
};

export default Page;
