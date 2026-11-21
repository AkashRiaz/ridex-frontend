"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { setUserBlockedAction } from "../../_actions/userBlockActions";

export function UnblockButton({ userId, name }: { userId: string; name: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isPending}
      aria-label={`Unblock ${name}`}
      onClick={() =>
        startTransition(async () => {
          const result = await setUserBlockedAction(userId, false);
          if (result.success) {
            toast.success(result.message);
            router.refresh();
          } else {
            toast.error(result.message);
          }
        })
      }
    >
      {isPending && <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />}
      Unblock
    </Button>
  );
}
