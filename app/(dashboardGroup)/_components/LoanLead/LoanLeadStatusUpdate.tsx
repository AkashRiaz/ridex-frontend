"use client";

import { useId, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FieldErrorText } from "@/components/ui/FieldErrorText";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LoanLeadStatusInput, LoanLeadStatusZodSchema } from "@/components/validations/loan-lead.validation";
import { LOAN_NOTE_MAX } from "@/lib/emi";
import { LOAN_LEAD_STATUS_LABEL, LOAN_LEAD_TRANSITIONS } from "@/lib/enum";
import { ILoanLeadAdmin } from "@/types";
import { TAdminLoanLeadStatus, updateLoanLeadStatusAction } from "../../_actions/loanLeadActions";

const NEEDS_REASON: TAdminLoanLeadStatus[] = ["REJECTED", "CLOSED"];

/*
 * Admin records what the partner reported: contacted, approved, disbursed,
 * rejected, or closes the request. Only allowed next steps are offered.
 */
export default function LoanLeadStatusUpdate({ lead }: { lead: ILoanLeadAdmin }) {
  const formId = useId();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const nextStatuses = LOAN_LEAD_TRANSITIONS[lead.status] as TAdminLoanLeadStatus[];

  const defaultValues: LoanLeadStatusInput = {
    status: nextStatuses[0] ?? "CLOSED",
    note: "",
    partnerReference: lead.partnerReference ?? "",
  };

  const form = useForm({
    defaultValues,
    validators: { onSubmit: LoanLeadStatusZodSchema },
    onSubmit: async ({ value }) => {
      startTransition(async () => {
        const result = await updateLoanLeadStatusAction(lead.id, {
          status: value.status,
          ...(value.note.trim() && { note: value.note.trim() }),
          ...(value.partnerReference.trim() !== (lead.partnerReference ?? "") && {
            partnerReference: value.partnerReference.trim(),
          }),
        });

        if (result.success) {
          toast.success(result.message);
          router.refresh();
        } else toast.error(result.message);
      });
    },
  });

  if (nextStatuses.length === 0) return null;

  return (
    <section className="space-y-3 rounded-2xl border bg-card p-5 shadow-card" aria-labelledby={`${formId}-heading`}>
      <div>
        <h2 id={`${formId}-heading`} className="font-semibold">
          {lead.status === "NEW" ? "Close without sending" : "Update status"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {lead.status === "NEW"
            ? "For spam or requests that can't be financed. The buyer sees your reason."
            : "Record what the partner reported. The buyer is notified."}
        </p>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          form.handleSubmit();
        }}
        noValidate
        className="space-y-4"
      >
        {nextStatuses.length > 1 && (
          <form.Field name="status">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={`${formId}-status`}>New status</Label>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange(value as TAdminLoanLeadStatus)}
                >
                  <SelectTrigger id={`${formId}-status`} className="w-full">
                    <SelectValue>{LOAN_LEAD_STATUS_LABEL[field.state.value]}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {nextStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {LOAN_LEAD_STATUS_LABEL[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </form.Field>
        )}

        {lead.status !== "NEW" && (
          <form.Field name="partnerReference">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <div className="space-y-2">
                  <Label htmlFor={`${formId}-reference`}>Partner reference</Label>
                  <Input
                    id={`${formId}-reference`}
                    placeholder="The partner's application number"
                    maxLength={60}
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                    aria-invalid={isInvalid}
                  />
                  <FieldErrorText show={isInvalid} errors={field.state.meta.errors} />
                </div>
              );
            }}
          </form.Field>
        )}

        <form.Subscribe selector={(state) => state.values.status}>
          {(status) => (
            <form.Field name="note">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                const needsReason = NEEDS_REASON.includes(status);

                return (
                  <div className="space-y-2">
                    <Label htmlFor={`${formId}-note`}>
                      {needsReason ? (
                        <>
                          Reason the buyer will see <span className="text-destructive">*</span>
                        </>
                      ) : (
                        "Internal note (optional)"
                      )}
                    </Label>
                    <Textarea
                      id={`${formId}-note`}
                      rows={2}
                      maxLength={LOAN_NOTE_MAX}
                      placeholder={needsReason ? "e.g. Income is too low for this loan amount" : undefined}
                      value={field.state.value}
                      onChange={(event) => field.handleChange(event.target.value)}
                      onBlur={field.handleBlur}
                      aria-invalid={isInvalid}
                    />
                    <FieldErrorText show={isInvalid} errors={field.state.meta.errors} />
                  </div>
                );
              }}
            </form.Field>
          )}
        </form.Subscribe>

        <Button type="submit" variant={lead.status === "NEW" ? "outline" : "default"} disabled={isPending}>
          {isPending ? <Loader2 className="animate-spin" /> : <Save />}
          {lead.status === "NEW" ? "Close request" : "Save status"}
        </Button>
      </form>
    </section>
  );
}
