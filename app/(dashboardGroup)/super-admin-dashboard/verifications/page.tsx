import { ManageVerificationsPage } from "@/app/(dashboardGroup)/_components/Verification/VerificationPages";

export const metadata = {
  title: "Verifications",
};

const Page = (props: PageProps<"/super-admin-dashboard/verifications">) => {
  return <ManageVerificationsPage searchParams={props.searchParams} dashboardPath="/super-admin-dashboard" />;
};

export default Page;
