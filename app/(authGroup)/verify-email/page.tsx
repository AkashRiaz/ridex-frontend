import Link from "next/link";
import AuthCard from "../_components/shared/AuthCard";
import VerifyEmailForm from "../_components/VerifyEmail/VerifyEmailForm";

export const metadata = {
  title: "Verify email",
};

type VerifyEmailPageProps = {
  searchParams?: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
};

const VerifyEmailPage = async ({ searchParams }: VerifyEmailPageProps) => {
  const params = (await searchParams) ?? {};
  const email = Array.isArray(params.email) ? params.email[0] : params.email;

  return (
    <AuthCard
      title="Verify your email"
      description="Enter the 6-digit code to activate your account"
      footer={
        <Link href="/login" className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      }
    >
      <VerifyEmailForm email={email} />
    </AuthCard>
  );
};

export default VerifyEmailPage;
