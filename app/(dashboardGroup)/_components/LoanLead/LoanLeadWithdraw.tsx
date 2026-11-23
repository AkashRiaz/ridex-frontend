"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Undo2 } from "lucide-react";
import Swal from "sweetalert2";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LOAN_NOTE_MAX } from "@/lib/emi";
import { withdrawLoanLeadAction } from "../../_actions/loanLeadActions";

/*
 * Buyer withdraws a request (optional reason) while no partner has called yet.
 */
export default function LoanLeadWithdraw({ id, sentToPartner }: { id: string; sentToPartner: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleWithdraw = async () => {
    const confirmation = await Swal.fire({
      title: "Withdraw this request?",
      text: sentToPartner
        ? "We'll let the finance partner know you no longer need this loan."
        : "We won't send it to a finance partner.",
      input: "textarea",
      inputLabel: "Reason (optional)",
      inputPlaceholder: "e.g. I bought another bike",
      inputAttributes: { maxlength: String(LOAN_NOTE_MAX) },
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Withdraw",
      cancelButtonText: "Keep it",
      confirmButtonColor: "#dc2626",
      reverseButtons: true,
    });

    if (!confirmation.isConfirmed) return;

    const reason = typeof confirmation.value === "string" ? confirmation.value.trim() : "";

    startTransition(async () => {
      const result = await withdrawLoanLeadAction(id, reason || undefined);

      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else toast.error(result.message);
    });
  };

  return (
    <Button type="button" variant="outline" onClick={handleWithdraw} disabled={isPending}>
      {isPending ? <Loader2 className="animate-spin" /> : <Undo2 />}
      Withdraw request
    </Button>
  );
}
