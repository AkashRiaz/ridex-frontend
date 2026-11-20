"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Flag, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { REPORT_REASON_LABEL, REPORT_REASONS_BY_TARGET, REPORT_TARGET_LABEL } from "@/lib/enum";
import { cn } from "@/lib/utils";
import { TReportReason, TReportTargetType } from "@/types";
import { createReportAction } from "@/app/(dashboardGroup)/_actions/reportActions";

type ReportDialogProps = {
  targetType: TReportTargetType;
  targetId: string;
  isSignedIn: boolean;
  // trigger text, e.g. "Report listing"
  label?: string;
  triggerClassName?: string;
};

/*
 * Reason picker + optional details. Used for listings, sellers and reviews.
 */
export function ReportDialog({ targetType, targetId, isSignedIn, label, triggerClassName }: ReportDialogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<TReportReason | null>(null);
  const [details, setDetails] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const triggerLabel = label ?? `Report ${REPORT_TARGET_LABEL[targetType].toLowerCase()}`;
  const triggerClass = cn(
    "inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition hover:text-destructive",
    triggerClassName,
  );

  if (!isSignedIn) {
    return (
      <button
        type="button"
        className={triggerClass}
        onClick={() => router.push(`/login?redirectTo=${encodeURIComponent(pathname)}`)}
      >
        <Flag className="size-3.5" aria-hidden="true" /> {triggerLabel}
      </button>
    );
  }

  const submit = () => {
    if (!reason) {
      setError("Choose a reason");
      return;
    }
    if (reason === "OTHER" && !details.trim()) {
      setError("Tell us what is wrong");
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await createReportAction({
        targetType,
        targetId,
        reason,
        details: details.trim() || undefined,
      });

      if (result.success) {
        toast.success(result.message);
        setOpen(false);
        setReason(null);
        setDetails("");
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<button type="button" className={triggerClass} />}>
        <Flag className="size-3.5" aria-hidden="true" /> {triggerLabel}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{triggerLabel}</DialogTitle>
          <DialogDescription>
            Reports are private. The person you report is not told who reported them.
          </DialogDescription>
        </DialogHeader>

        <fieldset className="space-y-2">
          <legend className="mb-2 text-sm font-medium">What is wrong?</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {REPORT_REASONS_BY_TARGET[targetType].map((option) => (
              <label
                key={option}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition hover:bg-muted",
                  reason === option && "border-primary bg-primary/5",
                )}
              >
                <input
                  type="radio"
                  name="report-reason"
                  value={option}
                  checked={reason === option}
                  onChange={() => setReason(option)}
                  className="accent-primary"
                />
                {REPORT_REASON_LABEL[option]}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="space-y-2">
          <Label htmlFor="report-details">
            Details {reason === "OTHER" ? <span className="text-destructive">*</span> : "(optional)"}
          </Label>
          <Textarea
            id="report-details"
            value={details}
            maxLength={1000}
            onChange={(event) => setDetails(event.target.value)}
            placeholder="Anything that helps our team check this"
          />
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button type="button" onClick={submit} disabled={isPending}>
            {isPending ? <Loader2 className="animate-spin" /> : <Flag />}
            Send report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
