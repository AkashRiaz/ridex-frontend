"use client";

import { useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteMyAccountAction } from "../../_actions/profileActions";

const DeleteAccount = ({ hasPassword }: { hasPassword: boolean }) => {
  const [isPending, startTransition] = useTransition();

  const handleDelete = async () => {
    const confirmation = await Swal.fire({
      title: "Delete your account?",
      text: hasPassword
        ? "Enter your password to confirm. Your listings and messages will no longer be visible."
        : "Your listings and messages will no longer be visible.",
      icon: "warning",
      input: hasPassword ? "password" : undefined,
      inputPlaceholder: "Your password",
      inputAttributes: { autocomplete: "current-password" },
      inputValidator: hasPassword
        ? (value: string) => (!value ? "Password is required" : undefined)
        : undefined,
      showCancelButton: true,
      confirmButtonText: "Yes, delete my account",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      reverseButtons: true,
    });

    if (!confirmation.isConfirmed) return;

    startTransition(async () => {
      // redirects to "/" on success
      const result = await deleteMyAccountAction(
        typeof confirmation.value === "string" ? confirmation.value : "",
      );

      if (!result.success) toast.error(result.message);
    });
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-destructive/30 bg-destructive/5 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="font-semibold text-destructive">Delete account</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Your account is deactivated and you are signed out everywhere. An admin can restore it.
        </p>
      </div>
      <Button
        type="button"
        variant="destructive"
        onClick={handleDelete}
        disabled={isPending}
        className="shrink-0"
      >
        {isPending ? <Loader2 className="animate-spin" /> : <Trash2 />}
        Delete account
      </Button>
    </div>
  );
};

export default DeleteAccount;
