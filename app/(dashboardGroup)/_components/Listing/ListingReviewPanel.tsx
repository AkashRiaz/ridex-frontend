"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Trash2, XCircle } from "lucide-react";
import Swal from "sweetalert2";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { IListingDetail, Role } from "@/types";
import { deleteListingAction, updateListingStatusAction } from "../../_actions/listingActions";

/*
 * Moderator controls: approve, reject with a reason (shown to the seller), delete (admins).
 */
const ListingReviewPanel = ({
  listing,
  actorRole,
  listPath,
}: {
  listing: IListingDetail;
  actorRole: Role;
  listPath: string;
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const canApprove = listing.status === "PENDING";
  const canReject = listing.status === "PENDING" || listing.status === "APPROVED";
  const canDelete = actorRole === "ADMIN" || actorRole === "SUPER_ADMIN";

  const approve = () =>
    startTransition(async () => {
      const result = await updateListingStatusAction(listing.id, "APPROVED");

      if (result.success) {
        toast.success("Approved — the listing is live");
        router.push(`${listPath}?status=PENDING`);
        router.refresh();
      } else toast.error(result.message);
    });

  const reject = async () => {
    const confirmation = await Swal.fire({
      title: listing.status === "APPROVED" ? "Take this listing down?" : "Reject listing?",
      input: "textarea",
      inputLabel: "Reason (the seller will see this)",
      inputPlaceholder: "e.g. Photos do not show the actual vehicle",
      inputValidator: (value: string) => (!value?.trim() ? "A reason is required" : undefined),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Reject",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      reverseButtons: true,
    });

    if (!confirmation.isConfirmed || typeof confirmation.value !== "string") return;

    startTransition(async () => {
      const result = await updateListingStatusAction(listing.id, "REJECTED", confirmation.value.trim());

      if (result.success) {
        toast.success("Listing rejected");
        router.push(`${listPath}?status=PENDING`);
        router.refresh();
      } else toast.error(result.message);
    });
  };

  const remove = async () => {
    const confirmation = await Swal.fire({
      title: "Delete listing?",
      text: "It will be removed for everyone, including the seller.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      reverseButtons: true,
    });

    if (!confirmation.isConfirmed) return;

    startTransition(async () => {
      const result = await deleteListingAction(listing.id);

      if (result.success) {
        toast.success(result.message);
        router.push(listPath);
        router.refresh();
      } else toast.error(result.message);
    });
  };

  if (!canApprove && !canReject && !canDelete) return null;

  return (
    <section className="space-y-3 rounded-2xl border bg-card p-5 shadow-card" aria-label="Moderation">
      <h2 className="font-semibold">Moderation</h2>
      {listing.rejectionReason && (
        <p className="rounded-lg bg-destructive/5 p-3 text-sm">
          <span className="font-medium">Last rejection:</span> {listing.rejectionReason}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {canApprove && (
          <Button type="button" onClick={approve} disabled={isPending}>
            {isPending ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
            Approve
          </Button>
        )}
        {canReject && (
          <Button type="button" variant="outline" onClick={reject} disabled={isPending}>
            <XCircle /> {listing.status === "APPROVED" ? "Take down" : "Reject"}
          </Button>
        )}
        {canDelete && (
          <Button type="button" variant="ghost" onClick={remove} disabled={isPending}>
            <Trash2 className="text-destructive" /> Delete
          </Button>
        )}
      </div>
    </section>
  );
};

export default ListingReviewPanel;
