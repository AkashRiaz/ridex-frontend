"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MessageSquareReply, Pencil, Send, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ReviewCard } from "@/components/review/ReviewCard";
import { ReviewForm } from "@/components/review/ReviewForm";
import { ReviewReplyZodSchema } from "@/components/validations/review.validation";
import { IReview } from "@/types";
import { deleteReviewAction, replyToReviewAction } from "../../_actions/reviewActions";

/*
 * Received review + one-time public reply (sellers / dealers).
 */
export function ReceivedReviewItem({ review }: { review: IReview }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [reply, setReply] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const submit = () => {
    const parsed = ReviewReplyZodSchema.safeParse({ reply });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Write a reply");
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await replyToReviewAction(review.id, parsed.data.reply);

      if (result.success) {
        toast.success(result.message);
        setIsOpen(false);
        router.refresh();
      } else toast.error(result.message);
    });
  };

  const canReply = !review.sellerReply && !review.isHidden;

  return (
    <ReviewCard
      review={review}
      actions={
        canReply ? (
          isOpen ? (
            <div className="w-full space-y-2">
              <Label htmlFor={`reply-${review.id}`}>Your public reply (you can reply once)</Label>
              <Textarea
                id={`reply-${review.id}`}
                value={reply}
                maxLength={1000}
                onChange={(event) => setReply(event.target.value)}
                placeholder="Thank the buyer or explain your side politely"
                aria-invalid={Boolean(error)}
              />
              {error && (
                <p className="text-xs text-destructive" role="alert">
                  {error}
                </p>
              )}
              <div className="flex gap-2">
                <Button type="button" size="sm" onClick={submit} disabled={isPending}>
                  {isPending ? <Loader2 className="animate-spin" /> : <Send />}
                  Post reply
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => setIsOpen(false)} disabled={isPending}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button type="button" size="sm" variant="outline" onClick={() => setIsOpen(true)}>
              <MessageSquareReply /> Reply
            </Button>
          )
        ) : undefined
      }
    />
  );
}

/*
 * A review the user wrote: edit (30 days) or delete.
 */
export function GivenReviewItem({ review }: { review: IReview }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const remove = async () => {
    const confirmation = await Swal.fire({
      title: "Delete your review?",
      text: "The seller's rating will be recalculated. You cannot review this listing again.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      reverseButtons: true,
    });

    if (!confirmation.isConfirmed) return;

    startTransition(async () => {
      const result = await deleteReviewAction(review.id);

      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else toast.error(result.message);
    });
  };

  if (isEditing) {
    return (
      <div className="space-y-3 rounded-2xl border bg-card p-5">
        <p className="text-sm font-semibold">Edit your review of {review.seller.name}</p>
        <ReviewForm
          listingId={review.listingId}
          review={review}
          onDone={() => setIsEditing(false)}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <ReviewCard
      review={review}
      perspective="seller"
      actions={
        <>
          {review.canEdit ? (
            <Button type="button" size="sm" variant="outline" onClick={() => setIsEditing(true)} disabled={isPending}>
              <Pencil /> Edit
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground">The 30-day edit window has closed</span>
          )}
          <Button type="button" size="sm" variant="ghost" onClick={remove} disabled={isPending}>
            {isPending ? <Loader2 className="animate-spin" /> : <Trash2 className="text-destructive" />}
            Delete
          </Button>
        </>
      }
    />
  );
}
