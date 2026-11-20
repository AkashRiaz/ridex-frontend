import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { siteConfig } from "@/lib/siteConfig";
import AuthCard from "../_components/shared/AuthCard";
import LoginForm from "../_components/Login/LoginForm";
import PhoneOtpLoginForm from "../_components/Login/PhoneOtpLoginForm";

export const metadata = {
  title: "Login",
};

type LoginPageProps = {
  searchParams?: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
};

const getValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const LoginPage = async ({ searchParams }: LoginPageProps) => {
  const params = (await searchParams) ?? {};

  const method = getValue(params.method) === "otp" ? "otp" : "password";
  const redirectTo = getValue(params.redirectTo);
  const isReset = getValue(params.reset) === "success";

  const tabHref = (tab: "password" | "otp") => {
    const query = new URLSearchParams();
    if (tab === "otp") query.set("method", "otp");
    if (redirectTo) query.set("redirectTo", redirectTo);
    const queryString = query.toString();
    return queryString ? `/login?${queryString}` : "/login";
  };

  return (
    <AuthCard
      title="Welcome back"
      description={`Sign in to your ${siteConfig.name} account`}
      footer={
        <>
          New to {siteConfig.name}?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      {isReset && (
        <div
          role="status"
          className="mb-5 flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm"
        >
          <CheckCircle2 className="size-4 shrink-0 text-success" aria-hidden="true" />
          Password reset. Sign in with your new password.
        </div>
      )}

      <Tabs className="mb-6 items-center">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger href={tabHref("password")} active={method === "password"} replace>
            Password
          </TabsTrigger>
          <TabsTrigger href={tabHref("otp")} active={method === "otp"} replace>
            Phone OTP
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {method === "otp" ? (
        <PhoneOtpLoginForm redirectTo={redirectTo} />
      ) : (
        <LoginForm redirectTo={redirectTo} />
      )}
    </AuthCard>
  );
};

export default LoginPage;
