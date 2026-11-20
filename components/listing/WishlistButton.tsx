"use client";

import { useOptimistic, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { toggleWishlistAction } from "@/app/(dashboardGroup)/_actions/wishlistActions";

type WishlistButtonProps = {
  listingId: string;
  saved: boolean;
  isSignedIn: boolean;
  // "icon": round button over a card photo · "button": labelled button on the detail page
  variant?: "icon" | "button";
  className?: string;
};

/*
 * Optimistic save / unsave. Signed-out visitors are sent to login and come back.
 */
export function WishlistButton({
  listingId,
  saved,
  isSignedIn,
  variant = "icon",
  className,
}: WishlistButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const [optimisticSaved, setOptimisticSaved] = useOptimistic(saved);

  const toggle = () => {
    if (!isSignedIn) {
      router.push(`/login?redirectTo=${encodeURIComponent(pathname)}`);
      return;
    }

    const next = !optimisticSaved;

    startTransition(async () => {
      setOptimisticSaved(next);
      const result = await toggleWishlistAction(listingId, next);

      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  };

  const label = optimisticSaved ? "Remove from wishlist" : "Save to wishlist";

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-pressed={optimisticSaved}
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-lg border px-4 text-sm font-medium transition hover:bg-muted",
          optimisticSaved && "border-destructive/30 text-destructive",
          className,
        )}
      >
        <Heart className={cn("size-4", optimisticSaved && "fill-current")} aria-hidden="true" />
        {optimisticSaved ? "Saved" : "Save"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={optimisticSaved}
      aria-label={label}
      title={label}
      className={cn(
        // above the card's stretched link
        "relative z-10 inline-flex size-9 items-center justify-center rounded-full bg-background/90 shadow-sm backdrop-blur transition hover:scale-105 motion-reduce:hover:scale-100",
        className,
      )}
    >
      <Heart
        className={cn("size-4", optimisticSaved ? "fill-destructive text-destructive" : "text-foreground")}
        aria-hidden="true"
      />
    </button>
  );
}
