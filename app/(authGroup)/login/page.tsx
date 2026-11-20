import Link from "next/link";
import { siteConfig } from "@/lib/siteConfig";

export const metadata = {
  title: "Login",
};

/*
 * Placeholder. LoginForm + loginActions are built with the auth module (Phase 1).
 */
const LoginPage = () => {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border bg-card p-8 text-center shadow-card">
        <h1 className="text-2xl font-bold">Login to {siteConfig.name}</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Sign in is coming in Phase 1.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block text-sm font-medium text-primary hover:underline"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
};

export default LoginPage;
