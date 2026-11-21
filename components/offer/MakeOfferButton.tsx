"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { HandCoins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDashboardPath } from "@/lib/dashboardPath";
import { isChatRole } from "@/lib/enum";
import { cn } from "@/lib/utils";
import { Role } from "@/types";
import { OfferDialog } from "./OfferDialog";

type MakeOfferButtonProps = {
  listingId: string;
  listingTitle: string;
  listingPrice: number;
  isSignedIn: boolean;
  viewerRole: Role | null;
  className?: string;
};

/*
 * Listing page: opens the offer dialog, then jumps to the chat thread
 * where the offer card now lives. Visitors are sent to log in first.
 */
export function MakeOfferButton({
  listingId,
  listingTitle,
  listingPrice,
  isSignedIn,
  viewerRole,
  className,
}: MakeOfferButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // staff accounts do not buy
  if (isSignedIn && !isChatRole(viewerRole)) return null;

  const openDialog = () => {
    if (!isSignedIn) {
      router.push(`/login?redirectTo=${encodeURIComponent(pathname)}`);
      return;
    }
    setOpen(true);
  };

  return (
    <>
      <Button type="button" variant="outline" onClick={openDialog} className={cn("w-full", className)}>
        <HandCoins className="size-4" aria-hidden="true" /> Make an offer
      </Button>

      {isSignedIn && (
        <OfferDialog
          open={open}
          onOpenChange={setOpen}
          mode={{ kind: "make", listingId }}
          listingTitle={listingTitle}
          listingPrice={listingPrice}
          onDone={(offer) => router.push(`${getDashboardPath(viewerRole)}/messages/${offer.conversationId}`)}
        />
      )}
    </>
  );
}
