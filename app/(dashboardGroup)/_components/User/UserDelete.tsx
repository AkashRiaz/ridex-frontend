"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteUserAction } from "../../_actions/userActions";

const UserDelete = ({
  userId,
  userName,
  showLabel = false,
  redirectTo,
}: {
  userId: string;
  userName: string;
  showLabel?: boolean;
  redirectTo?: string;
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = async () => {
    const confirmation = await Swal.fire({
      title: "Delete user?",
      text: `You are about to delete ${userName}. They will be signed out and hidden. You can restore them later.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      reverseButtons: true,
    });

    if (!confirmation.isConfirmed) return;

    startTransition(async () => {
      const result = await deleteUserAction(userId);

      if (result.success) {
        toast.success(result.message);
        if (redirectTo) router.push(redirectTo);
        router.refresh();
      } else toast.error(result.message);
    });
  };

  return (
    <Button
      type="button"
      variant="destructive"
      size={showLabel ? "default" : "icon-sm"}
      onClick={handleDelete}
      disabled={isPending}
      aria-label={`Delete ${userName}`}
      title={`Delete ${userName}`}
    >
      {isPending ? <Loader2 className="animate-spin" /> : <Trash2 />}
      {showLabel && "Delete"}
    </Button>
  );
};

export default UserDelete;
