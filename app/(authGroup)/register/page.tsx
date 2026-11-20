import Link from "next/link";
import { siteConfig } from "@/lib/siteConfig";
import AuthCard from "../_components/shared/AuthCard";
import RegisterForm from "../_components/Register/RegisterForm";

export const metadata = {
  title: "Create account",
};

const RegisterPage = () => {
  return (
    <AuthCard
      title="Create your account"
      description={`Join ${siteConfig.name} to buy, sell and ride`}
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthCard>
  );
};

export default RegisterPage;
