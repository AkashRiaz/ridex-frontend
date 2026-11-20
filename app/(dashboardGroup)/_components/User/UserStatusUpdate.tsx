"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ban, CircleCheck, Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { UserStatus } from "@/types";
import { updateUserStatusAction } from "../../_actions/userActions";

type UserStatusUpdateProps = {
  userId: string;
  userName: string;
  status: UserStatus;
  showLabel?: boolean;
};

const UserStatusUpdate = ({
  userId,
  userName,
  status,
  showLabel = false,
}: UserStatusUpdateProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isBlocked = status === "BLOCKED";

  const handleClick = async () => {
    const confirmation = isBlocked
      ? await Swal.fire({
          title: "Unblock user?",
          text: `${userName} will be able to sign in again.`,
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Yes, unblock",
          cancelButtonText: "Cancel",
          reverseButtons: true,
        })
      : await Swal.fire({
          title: "Block user?",
          text: `${userName} will be signed out everywhere and cannot sign in.`,
          icon: "warning",
          input: "textarea",
          inputLabel: "Reason (shown in the audit log)",
          inputPlaceholder: "e.g. Repeated fake listings",
          inputValidator: (value) =>
            !value?.trim() ? "A reason is required" : undefined,
          showCancelButton: true,
          confirmButtonText: "Yes, block",
          cancelButtonText: "Cancel",
          confirmButtonColor: "#dc2626",
          reverseButtons: true,
        });

    if (!confirmation.isConfirmed) return;

    startTransition(async () => {
      const result = await updateUserStatusAction(
        userId,
        isBlocked ? "ACTIVE" : "BLOCKED",
        typeof confirmation.value === "string" ? confirmation.value.trim() : undefined,
      );

      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  };

  const label = isBlocked ? `Unblock ${userName}` : `Block ${userName}`;

  return (
    <Button
      type="button"
      variant={isBlocked ? "outline" : "secondary"}
      size={showLabel ? "default" : "icon-sm"}
      onClick={handleClick}
      disabled={isPending}
      aria-label={label}
      title={label}
    >
      {isPending ? (
        <Loader2 className="animate-spin" />
      ) : isBlocked ? (
        <CircleCheck />
      ) : (
        <Ban />
      )}
      {showLabel && (isBlocked ? "Unblock" : "Block")}
    </Button>
  );
};

export default UserStatusUpdate;
