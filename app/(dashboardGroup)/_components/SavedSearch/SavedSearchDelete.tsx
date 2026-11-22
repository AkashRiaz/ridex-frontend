"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteSavedSearchAction } from "../../_actions/savedSearchActions";

/*
 * Reference <Entity>Delete pattern: Swal confirm → action → toast → refresh.
 */
export default function SavedSearchDelete({
  id,
  name,
  showLabel = false,
  redirectTo,
}: {
  id: string;
  name: string;
  showLabel?: boolean;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = async () => {
    const confirmation = await Swal.fire({
      title: "Delete saved search?",
      text: `“${name}” and its alerts will be removed. Listings are not affected.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      reverseButtons: true,
    });

    if (!confirmation.isConfirmed) return;

    startTransition(async () => {
      const result = await deleteSavedSearchAction(id);

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
      size={showLabel ? "sm" : "icon-sm"}
      onClick={handleDelete}
      disabled={isPending}
      aria-label={`Delete ${name}`}
      title={`Delete ${name}`}
    >
      {isPending ? <Loader2 className="animate-spin" /> : <Trash2 />}
      {showLabel && "Delete"}
    </Button>
  );
}
