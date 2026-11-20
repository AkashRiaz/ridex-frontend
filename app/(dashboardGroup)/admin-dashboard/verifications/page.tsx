import { ManageVerificationsPage } from "@/app/(dashboardGroup)/_components/Verification/VerificationPages";

export const metadata = {
  title: "Verifications",
};

const Page = (props: PageProps<"/admin-dashboard/verifications">) => {
  return <ManageVerificationsPage searchParams={props.searchParams} dashboardPath="/admin-dashboard" />;
};

export default Page;
