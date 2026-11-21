"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDashboardPath } from "@/lib/dashboardPath";
import { isChatRole } from "@/lib/enum";
import { cn } from "@/lib/utils";
import { Role } from "@/types";
import { BookTestRideDialog } from "./BookTestRideDialog";

type BookTestRideButtonProps = {
  listingId: string;
  listingTitle: string;
  isSignedIn: boolean;
  viewerRole: Role | null;
  className?: string;
};

/*
 * Listing page: pick a slot, then jump to the chat thread with the request card.
 */
export function BookTestRideButton({ listingId, listingTitle, isSignedIn, viewerRole, className }: BookTestRideButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

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
        <CalendarClock className="size-4" aria-hidden="true" /> Book a test ride
      </Button>

      {isSignedIn && (
        <BookTestRideDialog
          open={open}
          onOpenChange={setOpen}
          listingId={listingId}
          listingTitle={listingTitle}
          onDone={(ride) => router.push(`${getDashboardPath(viewerRole)}/messages/${ride.conversationId}`)}
        />
      )}
    </>
  );
}
