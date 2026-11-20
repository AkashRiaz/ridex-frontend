import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { IUser } from "@/types";

/*
 * Pending dealers cannot post listings until their dealership is verified.
 */
export default function DealerVerificationBanner({ user }: { user?: IUser | null }) {
  if (!user || user.role !== "DEALER" || user.status !== "PENDING") return null;

  return (
    <div role="status" className="flex flex-wrap items-center gap-3 border-b border-warning/40 bg-warning/10 px-4 py-2.5 text-sm">
      <ShieldAlert className="size-4 shrink-0" aria-hidden="true" />
      <p className="flex-1">Your dealer account is waiting for verification. Upload your trade license to start posting listings.</p>
      <Link href="/dealer-dashboard/verification" className="font-medium text-primary hover:underline">
        Verify dealership
      </Link>
    </div>
  );
}
