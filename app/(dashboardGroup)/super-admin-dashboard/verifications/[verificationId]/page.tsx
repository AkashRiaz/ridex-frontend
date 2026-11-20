import { VerificationDetailPage } from "@/app/(dashboardGroup)/_components/Verification/VerificationPages";

export const metadata = {
  title: "Verification request",
};

const Page = (props: PageProps<"/super-admin-dashboard/verifications/[verificationId]">) => {
  return <VerificationDetailPage params={props.params} dashboardPath="/super-admin-dashboard" />;
};

export default Page;
