import Link from "next/link";
import AuthCard from "../_components/shared/AuthCard";
import ForgotPasswordForm from "../_components/ForgotPassword/ForgotPasswordForm";

export const metadata = {
  title: "Forgot password",
};

const ForgotPasswordPage = () => {
  return (
    <AuthCard
      title="Forgot your password?"
      description="We'll send a reset code to your email or phone"
      footer={
        <Link href="/login" className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
};

export default ForgotPasswordPage;
