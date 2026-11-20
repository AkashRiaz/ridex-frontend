"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, X } from "lucide-react";
import Swal from "sweetalert2";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { TActionState } from "@/types";
import { clearRecentlyViewedAction, removeRecentlyViewedAction } from "../../_actions/recentlyViewedActions";

const useRun = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const run = (action: () => Promise<TActionState>) =>
    startTransition(async () => {
      const result = await action();

      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else toast.error(result.message);
    });

  return { isPending, run };
};

export function RemoveRecentlyViewedButton({ listingId }: { listingId: string }) {
  const { isPending, run } = useRun();

  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      disabled={isPending}
      onClick={() => run(() => removeRecentlyViewedAction(listingId))}
    >
      {isPending ? <Loader2 className="animate-spin" /> : <X />}
      Remove
    </Button>
  );
}

export function ClearRecentlyViewedButton() {
  const { isPending, run } = useRun();

  const clear = async () => {
    const confirmation = await Swal.fire({
      title: "Clear your viewing history?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Clear",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (confirmation.isConfirmed) run(clearRecentlyViewedAction);
  };

  return (
    <Button type="button" variant="outline" disabled={isPending} onClick={clear}>
      {isPending ? <Loader2 className="animate-spin" /> : <Trash2 />}
      Clear history
    </Button>
  );
}
