"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RotateCcw } from "lucide-react";
import Swal from "sweetalert2";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { restoreUserAction } from "../../_actions/userActions";

const UserRestore = ({
  userId,
  userName,
  showLabel = false,
}: {
  userId: string;
  userName: string;
  showLabel?: boolean;
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleRestore = async () => {
    const confirmation = await Swal.fire({
      title: "Restore user?",
      text: `${userName} will be reactivated and can sign in again.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, restore",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!confirmation.isConfirmed) return;

    startTransition(async () => {
      const result = await restoreUserAction(userId);

      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else toast.error(result.message);
    });
  };

  return (
    <Button
      type="button"
      variant="outline"
      size={showLabel ? "default" : "icon-sm"}
      onClick={handleRestore}
      disabled={isPending}
      aria-label={`Restore ${userName}`}
      title={`Restore ${userName}`}
    >
      {isPending ? <Loader2 className="animate-spin" /> : <RotateCcw />}
      {showLabel && "Restore"}
    </Button>
  );
};

export default UserRestore;
