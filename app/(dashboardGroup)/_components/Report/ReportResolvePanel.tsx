"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Eye, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { REPORT_ACTION_LABEL } from "@/lib/enum";
import { cn } from "@/lib/utils";
import { IReportDetail, Role, TReportAction } from "@/types";
import { updateReportAction } from "../../_actions/reportActions";

const isAdminRole = (role: Role) => role === "ADMIN" || role === "SUPER_ADMIN";

// mirrors backend assertActionAllowed
const actionsFor = (report: IReportDetail, role: Role): TReportAction[] => {
  const actions: TReportAction[] = ["NONE"];

  if (report.targetType === "LISTING") {
    actions.push("TAKE_DOWN_LISTING");
    if (isAdminRole(role)) actions.push("BLOCK_USER");
  }
  if (report.targetType === "USER" && isAdminRole(role)) actions.push("BLOCK_USER");
  if (report.targetType === "REVIEW") actions.push("HIDE_REVIEW");

  return actions;
};

const ACTION_HINT: Record<TReportAction, string> = {
  NONE: "Close the report without changing anything",
  TAKE_DOWN_LISTING: "Rejects the listing; the seller sees your note",
  BLOCK_USER: "Blocks the account; they are signed out everywhere",
  HIDE_REVIEW: "Hides the review and recalculates the seller rating",
};

export default function ReportResolvePanel({ report, actorRole }: { report: IReportDetail; actorRole: Role }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [action, setAction] = useState<TReportAction>("NONE");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isClosed = report.status === "RESOLVED" || report.status === "DISMISSED";

  const submit = (status: "IN_REVIEW" | "RESOLVED" | "DISMISSED") => {
    if (status !== "IN_REVIEW" && !note.trim()) {
      setError("Add a note explaining the decision");
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await updateReportAction(report.id, {
        status,
        resolutionNote: note.trim() || undefined,
        ...(status === "RESOLVED" && { action }),
      });

      if (result.success) {
        toast.success(status === "IN_REVIEW" ? "Marked as in review" : result.message);
        router.refresh();
      } else toast.error(result.message);
    });
  };

  if (isClosed) {
    return (
      <section className="space-y-2 rounded-2xl border bg-card p-5 shadow-card" aria-label="Decision">
        <h2 className="font-semibold">Decision</h2>
        <p className="text-sm">
          {report.status === "RESOLVED" ? "Resolved" : "Dismissed"}
          {report.actionTaken && ` · ${REPORT_ACTION_LABEL[report.actionTaken]}`}
        </p>
        {report.resolutionNote && (
          <p className="rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground">{report.resolutionNote}</p>
        )}
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-2xl border bg-card p-5 shadow-card" aria-label="Resolve report">
      <h2 className="font-semibold">Resolve</h2>

      <fieldset className="space-y-2">
        <legend className="mb-1 text-sm font-medium">Action when resolving</legend>
        {actionsFor(report, actorRole).map((option) => (
          <label
            key={option}
            className={cn(
              "flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2 text-sm transition hover:bg-muted",
              action === option && "border-primary bg-primary/5",
            )}
          >
            <input
              type="radio"
              name="report-action"
              value={option}
              checked={action === option}
              onChange={() => setAction(option)}
              className="mt-1 accent-primary"
            />
            <span>
              <span className="font-medium">{REPORT_ACTION_LABEL[option]}</span>
              <span className="block text-xs text-muted-foreground">{ACTION_HINT[option]}</span>
            </span>
          </label>
        ))}
      </fieldset>

      <div className="space-y-2">
        <Label htmlFor="resolution-note">Note</Label>
        <Textarea
          id="resolution-note"
          value={note}
          maxLength={500}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Why you decided this (staff only; shown to the seller on a take-down)"
          aria-invalid={Boolean(error)}
        />
        {error && (
          <p className="text-xs text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Resolving also closes the other open reports about the same {report.targetType.toLowerCase()}.
      </p>

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => submit("RESOLVED")} disabled={isPending}>
          {isPending ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
          Resolve
        </Button>
        <Button type="button" variant="outline" onClick={() => submit("DISMISSED")} disabled={isPending}>
          <XCircle /> Dismiss
        </Button>
        {report.status === "OPEN" && (
          <Button type="button" variant="ghost" onClick={() => submit("IN_REVIEW")} disabled={isPending}>
            <Eye /> Mark in review
          </Button>
        )}
      </div>
    </section>
  );
}
