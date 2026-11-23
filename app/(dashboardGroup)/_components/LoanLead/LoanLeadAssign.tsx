"use client";

import { useId, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { CircleAlert, Loader2, Send } from "lucide-react";
import Swal from "sweetalert2";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FieldErrorText } from "@/components/ui/FieldErrorText";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LoanLeadAssignInput, LoanLeadAssignZodSchema } from "@/components/validations/loan-lead.validation";
import { LOAN_NOTE_MAX, formatRate } from "@/lib/emi";
import { IFinancePartner, ILoanLeadAdmin } from "@/types";
import { assignLoanLeadAction } from "../../_actions/loanLeadActions";

/*
 * Where the request's terms fall outside a partner's limits (a hint only:
 * the admin may still send it, the partner decides).
 */
const limitWarnings = (lead: ILoanLeadAdmin, partner: IFinancePartner | undefined) => {
  if (!partner) return [];

  const warnings: string[] = [];
  const downPercent = (lead.downPayment / lead.listingPrice) * 100;

  if (downPercent < partner.minDownPaymentPercent) {
    warnings.push(`Down payment is ${Math.round(downPercent)}%; ${partner.name} asks for ${partner.minDownPaymentPercent}%.`);
  }
  if (lead.tenureMonths > partner.maxTenureMonths) {
    warnings.push(`Tenure is ${lead.tenureMonths} months; ${partner.name} lends up to ${partner.maxTenureMonths}.`);
  }
  if (lead.interestRate < partner.interestRateMin || lead.interestRate > partner.interestRateMax) {
    warnings.push(
      `The estimate used ${formatRate(lead.interestRate)}; ${partner.name} offers ${formatRate(partner.interestRateMin)}–${formatRate(partner.interestRateMax)}.`,
    );
  }

  return warnings;
};

export default function LoanLeadAssign({
  lead,
  partners,
  dashboardPath,
}: {
  lead: ILoanLeadAdmin;
  partners: IFinancePartner[];
  dashboardPath: string;
}) {
  const formId = useId();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // the current partner can't be chosen again; start from the buyer's preference
  const choices = partners.filter((partner) => partner.isActive && partner.id !== lead.partner?.id);
  const preferred = choices.find((partner) => partner.id === lead.preferredPartner?.id);
  const isResend = lead.status === "SENT_TO_PARTNER";

  const defaultValues: LoanLeadAssignInput = { partnerId: preferred?.id ?? "", note: "" };

  const form = useForm({
    defaultValues,
    validators: { onSubmit: LoanLeadAssignZodSchema },
    onSubmit: async ({ value }) => {
      const partner = choices.find((item) => item.id === value.partnerId);
      if (!partner) return;

      const confirmation = await Swal.fire({
        title: `Send to ${partner.name}?`,
        text: `${partner.name} will get the applicant's contact details and loan terms by email at ${partner.contactEmail}.`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: isResend ? "Send to new partner" : "Send lead",
        cancelButtonText: "Cancel",
        reverseButtons: true,
      });

      if (!confirmation.isConfirmed) return;

      startTransition(async () => {
        const result = await assignLoanLeadAction(lead.id, {
          partnerId: partner.id,
          ...(value.note.trim() && { note: value.note.trim() }),
        });

        if (result.success) {
          toast.success(result.message);
          form.reset();
          router.refresh();
        } else toast.error(result.message);
      });
    },
  });

  return (
    <section className="space-y-3 rounded-2xl border bg-card p-5 shadow-card" aria-labelledby={`${formId}-heading`}>
      <div>
        <h2 id={`${formId}-heading`} className="font-semibold">
          {isResend ? "Send to another partner" : "Send to a finance partner"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {isResend
            ? `Use this if ${lead.partner?.name ?? "the partner"} can't take the request.`
            : "The partner gets the lead by email and contacts the buyer."}
        </p>
      </div>

      {choices.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No other active partners.{" "}
          <Link href={`${dashboardPath}/create-finance-partner`} className="font-medium text-primary hover:underline">
            Add a partner
          </Link>
        </p>
      ) : (
        <form
          id={formId}
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            form.handleSubmit();
          }}
          noValidate
          className="space-y-4"
        >
          <form.Field name="partnerId">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              const selected = choices.find((partner) => partner.id === field.state.value);
              const warnings = limitWarnings(lead, selected);

              return (
                <div className="space-y-2">
                  <Label htmlFor={`${formId}-partner`}>Partner</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => {
                      field.handleChange(String(value ?? ""));
                      field.handleBlur();
                    }}
                  >
                    <SelectTrigger id={`${formId}-partner`} className="w-full" aria-invalid={isInvalid}>
                      <SelectValue>{selected ? selected.name : "Choose a partner"}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {choices.map((partner) => (
                        <SelectItem key={partner.id} value={partner.id}>
                          {partner.name} · {formatRate(partner.interestRateMin)}–{formatRate(partner.interestRateMax)}
                          {partner.id === lead.preferredPartner?.id && " (buyer's choice)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldErrorText show={isInvalid} errors={field.state.meta.errors} />
                  {warnings.length > 0 && (
                    <ul className="space-y-1 rounded-lg border border-warning/40 bg-warning/10 p-2.5 text-xs">
                      {warnings.map((warning) => (
                        <li key={warning} className="flex gap-1.5">
                          <CircleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                          {warning}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            }}
          </form.Field>

          <form.Field name="note">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <div className="space-y-2">
                  <Label htmlFor={`${formId}-note`}>Note for the partner (optional)</Label>
                  <Textarea
                    id={`${formId}-note`}
                    rows={2}
                    maxLength={LOAN_NOTE_MAX}
                    placeholder="e.g. Salaried, phone verified"
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

          <Button type="submit" disabled={isPending}>
            {isPending ? <Loader2 className="animate-spin" /> : <Send />}
            {isResend ? "Send to new partner" : "Send lead"}
          </Button>
        </form>
      )}
    </section>
  );
}
