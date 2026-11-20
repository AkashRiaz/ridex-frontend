import Link from "next/link";
import { Bike } from "lucide-react";
import { siteConfig } from "@/lib/siteConfig";

type AuthCardProps = {
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

const AuthCard = ({ title, description, children, footer }: AuthCardProps) => {
  return (
    <div className="w-full max-w-md">
      <Link
        href="/"
        className="mx-auto mb-8 flex w-fit items-center gap-2.5"
        aria-label={`${siteConfig.name} home`}
      >
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <Bike size={22} aria-hidden="true" />
        </div>
        <span className="text-xl font-extrabold tracking-tight">
          {siteConfig.name}
        </span>
      </Link>

      <div className="rounded-2xl border bg-card p-6 shadow-card sm:p-8">
        <div className="mb-6 space-y-1.5 text-center">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        {children}
      </div>

      {footer && (
        <div className="mt-6 text-center text-sm text-muted-foreground">
          {footer}
        </div>
      )}
    </div>
  );
};

export default AuthCard;
