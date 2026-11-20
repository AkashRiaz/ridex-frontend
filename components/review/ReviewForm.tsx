"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { Loader2, Send, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FieldErrorText } from "@/components/ui/FieldErrorText";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ReviewInput, ReviewZodSchema } from "@/components/validations/review.validation";
import { cn } from "@/lib/utils";
import { IReview } from "@/types";
import { createReviewAction, updateReviewAction } from "@/app/(dashboardGroup)/_actions/reviewActions";

const STAR_HINT = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

type ReviewFormProps = {
  listingId: string;
  // edit mode when given
  review?: IReview;
  onDone?: () => void;
  onCancel?: () => void;
};

/*
 * 1–5 stars + optional comment. Creates a review, or edits the author's own.
 */
export function ReviewForm({ listingId, review, onDone, onCancel }: ReviewFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [hovered, setHovered] = useState(0);

  const form = useForm({
    defaultValues: { rating: review?.rating ?? 0, comment: review?.comment ?? "" } as ReviewInput,
    validators: { onSubmit: ReviewZodSchema },
    onSubmit: async ({ value }) => {
      startTransition(async () => {
        const result = review
          ? await updateReviewAction(review.id, value)
          : await createReviewAction({ listingId, ...value });

        if (result.success) {
          toast.success(result.message);
          onDone?.();
          router.refresh();
        } else {
          toast.error(result.message);
        }
      });
    },
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-4"
      noValidate
    >
      <form.Field name="rating">
        {(field) => {
          const shown = hovered || field.state.value;
          const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

          return (
            <fieldset className="space-y-1">
              <legend className="mb-1 text-sm font-medium">
                Your rating <span className="text-destructive">*</span>
              </legend>
              <div className="flex items-center gap-3">
                <div className="flex" onMouseLeave={() => setHovered(0)}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <label key={star} className="cursor-pointer p-0.5" onMouseEnter={() => setHovered(star)}>
                      <input
                        type="radio"
                        name="rating"
                        value={star}
                        checked={field.state.value === star}
                        onChange={() => {
                          field.handleChange(star);
                          field.handleBlur();
                        }}
                        className="peer sr-only"
                      />
                      <span className="sr-only">
                        {star} star{star === 1 ? "" : "s"}
                      </span>
                      <Star
                        className={cn(
                          "size-7 rounded transition peer-focus-visible:ring-2 peer-focus-visible:ring-ring",
                          star <= shown ? "fill-warning text-warning" : "text-muted-foreground/40",
                        )}
                        aria-hidden="true"
                      />
                    </label>
                  ))}
                </div>
                <span className="text-sm text-muted-foreground" aria-live="polite">
                  {STAR_HINT[shown]}
                </span>
              </div>
              <FieldErrorText show={isInvalid} errors={field.state.meta.errors} />
            </fieldset>
          );
        }}
      </form.Field>

      <form.Field name="comment">
        {(field) => {
          const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

          return (
            <div className="space-y-2">
              <Label htmlFor="review-comment">Comment (optional)</Label>
              <Textarea
                id="review-comment"
                value={field.state.value}
                maxLength={1000}
                placeholder="Was the vehicle as described? How was the deal?"
                onChange={(event) => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
                aria-invalid={isInvalid}
              />
              <div className="flex justify-between gap-2">
                <FieldErrorText show={isInvalid} errors={field.state.meta.errors} />
                <span className="ml-auto text-xs text-muted-foreground">{field.state.value.length}/1000</span>
              </div>
            </div>
          );
        }}
      </form.Field>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="animate-spin" /> : <Send />}
          {review ? "Save changes" : "Post review"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
