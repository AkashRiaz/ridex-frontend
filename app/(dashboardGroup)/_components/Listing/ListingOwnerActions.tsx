"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleDollarSign, Loader2, Pencil, RefreshCw, Send, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { IListingCard, TActionState } from "@/types";
import {
  deleteListingAction,
  markListingSoldAction,
  renewListingAction,
  submitListingAction,
} from "../../_actions/listingActions";

/*
 * Status-aware actions under each card in "My listings".
 */
const ListingOwnerActions = ({
  listing,
  dashboardPath,
}: {
  listing: IListingCard;
  dashboardPath: string;
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const run = (action: () => Promise<TActionState<unknown>>) => {
    startTransition(async () => {
      const result = await action();

      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  };

  const confirm = async (title: string, text: string, confirmButtonText: string, danger = false) =>
    (
      await Swal.fire({
        title,
        text,
        icon: danger ? "warning" : "question",
        showCancelButton: true,
        confirmButtonText,
        cancelButtonText: "Cancel",
        ...(danger && { confirmButtonColor: "#dc2626" }),
        reverseButtons: true,
      })
    ).isConfirmed;

  const editHref = `${dashboardPath}/my-listings/${listing.id}/edit`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {listing.status !== "SOLD" && (
        <Link
          href={listing.status === "DRAFT" ? editHref : `${editHref}?step=3`}
          className="inline-flex h-7 items-center gap-1.5 rounded-md border px-2.5 text-[0.8rem] font-medium transition hover:bg-muted"
        >
          <Pencil className="size-3.5" aria-hidden="true" />
          {listing.status === "DRAFT" ? "Continue" : "Edit"}
        </Link>
      )}

      {(listing.status === "DRAFT" || listing.status === "REJECTED") && (
        <Button type="button" size="sm" disabled={isPending} onClick={() => run(() => submitListingAction(listing.id))}>
          {isPending ? <Loader2 className="animate-spin" /> : <Send />}
          Submit
        </Button>
      )}

      {listing.status === "APPROVED" && (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={isPending}
          onClick={async () => {
            if (await confirm("Mark as sold?", `${listing.title} will show as sold and leave search results.`, "Yes, it's sold")) {
              run(() => markListingSoldAction(listing.id));
            }
          }}
        >
          <CircleDollarSign /> Mark sold
        </Button>
      )}

      {listing.status === "EXPIRED" && (
        <Button type="button" size="sm" disabled={isPending} onClick={() => run(() => renewListingAction(listing.id))}>
          <RefreshCw /> Renew
        </Button>
      )}

      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        disabled={isPending}
        aria-label={`Delete ${listing.title}`}
        title="Delete"
        onClick={async () => {
          if (await confirm("Delete listing?", `${listing.title} will be removed. This cannot be undone.`, "Yes, delete it", true)) {
            run(() => deleteListingAction(listing.id));
          }
        }}
      >
        <Trash2 className="text-destructive" />
      </Button>
    </div>
  );
};

export default ListingOwnerActions;
