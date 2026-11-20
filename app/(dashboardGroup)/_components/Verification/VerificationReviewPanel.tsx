"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import Swal from "sweetalert2";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { IVerificationRequestDetail } from "@/types";
import { reviewVerificationAction } from "../../_actions/verificationActions";

/*
 * Admin approve / reject (reason shown to the user).
 */
export default function VerificationReviewPanel({
  request,
  listPath,
  isOwnRequest,
}: {
  request: IVerificationRequestDetail;
  listPath: string;
  isOwnRequest: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const finish = (result: { success: boolean; message: string }) => {
    if (result.success) {
      toast.success(result.message);
      router.push(listPath);
      router.refresh();
    } else toast.error(result.message);
  };

  const approve = async () => {
    const confirmation = await Swal.fire({
      title: request.type === "ID" ? "Approve ID verification?" : "Approve dealership?",
      text:
        request.type === "ID"
          ? "The user gets the ID verified badge."
          : "The dealer gets the verified dealer badge and, if pending, can start posting listings.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Approve",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!confirmation.isConfirmed) return;

    startTransition(async () => finish(await reviewVerificationAction(request.id, { status: "APPROVED" })));
  };

  const reject = async () => {
    const confirmation = await Swal.fire({
      title: "Reject request?",
      input: "textarea",
      inputLabel: "Reason (the user will see this)",
      inputPlaceholder: "e.g. The NID photo is blurry — please upload a sharper photo",
      inputValidator: (value: string) => (!value?.trim() ? "A reason is required" : undefined),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Reject",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      reverseButtons: true,
    });

    if (!confirmation.isConfirmed || typeof confirmation.value !== "string") return;

    const reason = confirmation.value.trim();
    startTransition(async () => finish(await reviewVerificationAction(request.id, { status: "REJECTED", reason })));
  };

  if (request.status !== "PENDING") {
    return (
      <section className="space-y-2 rounded-2xl border bg-card p-5 shadow-card" aria-label="Decision">
        <h2 className="font-semibold">Decision</h2>
        <p className="text-sm">{request.status === "APPROVED" ? "Approved" : "Rejected"}</p>
        {request.rejectionReason && (
          <p className="rounded-lg bg-destructive/5 p-3 text-sm">{request.rejectionReason}</p>
        )}
      </section>
    );
  }

  return (
    <section className="space-y-3 rounded-2xl border bg-card p-5 shadow-card" aria-label="Review">
      <h2 className="font-semibold">Review</h2>
      {isOwnRequest ? (
        <p className="text-sm text-muted-foreground">Another admin must review your own request.</p>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Check that names, numbers and photos match. Reject with a clear reason so the user can fix it.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={approve} disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
              Approve
            </Button>
            <Button type="button" variant="outline" onClick={reject} disabled={isPending}>
              <XCircle /> Reject
            </Button>
          </div>
        </>
      )}
    </section>
  );
}
