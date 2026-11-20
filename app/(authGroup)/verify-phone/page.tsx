import Link from "next/link";
import AuthCard from "../_components/shared/AuthCard";
import VerifyPhoneForm from "../_components/VerifyPhone/VerifyPhoneForm";

export const metadata = {
  title: "Verify phone",
};

type VerifyPhonePageProps = {
  searchParams?: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
};

const VerifyPhonePage = async ({ searchParams }: VerifyPhonePageProps) => {
  const params = (await searchParams) ?? {};
  const phone = Array.isArray(params.phone) ? params.phone[0] : params.phone;

  return (
    <AuthCard
      title="Verify your phone"
      description="Enter the 6-digit code we sent by SMS"
      footer={
        <Link href="/login" className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      }
    >
      <VerifyPhoneForm phone={phone} />
    </AuthCard>
  );
};

export default VerifyPhonePage;
