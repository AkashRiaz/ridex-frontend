import Link from "next/link";
import { UnsubscribeConfirm } from "../_components/Unsubscribe/UnsubscribeConfirm";

export const metadata = {
  title: "Unsubscribe",
  robots: { index: false, follow: false },
};

const Page = async (props: PageProps<"/unsubscribe">) => {
  const { token } = await props.searchParams;
  const value = Array.isArray(token) ? token[0] : token;

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md items-center px-4 py-16">
      <div className="w-full rounded-2xl border bg-card p-8 shadow-card">
        {value ? (
          <UnsubscribeConfirm token={value} />
        ) : (
          <div className="text-center">
            <h1 className="text-xl font-semibold">This link is incomplete</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Open the unsubscribe link from your email again, or change your settings after signing in.
            </p>
            <Link href="/login" className="mt-5 inline-flex text-sm font-medium text-primary hover:underline">
              Sign in
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
