import Link from "next/link";
import AuthCard from "../_components/shared/AuthCard";
import ResetPasswordForm from "../_components/ResetPassword/ResetPasswordForm";

export const metadata = {
  title: "Reset password",
};

type ResetPasswordPageProps = {
  searchParams?: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
};

const ResetPasswordPage = async ({ searchParams }: ResetPasswordPageProps) => {
  const params = (await searchParams) ?? {};
  const identifier = Array.isArray(params.identifier)
    ? params.identifier[0]
    : params.identifier;
  const channel = Array.isArray(params.channel) ? params.channel[0] : params.channel;

  return (
    <AuthCard
      title="Set a new password"
      description={
        identifier
          ? `Enter the code we sent ${channel === "PHONE" ? "by SMS" : "by email"} to ${identifier}`
          : "Enter your reset code and a new password"
      }
      footer={
        <Link href="/login" className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      }
    >
      <ResetPasswordForm identifier={identifier} />
    </AuthCard>
  );
};

export default ResetPasswordPage;
