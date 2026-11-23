"use client";

import { useId, useTransition } from "react";
import { useForm } from "@tanstack/react-form";
import { Landmark, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createLoanLeadAction } from "@/app/(dashboardGroup)/_actions/loanLeadActions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldErrorText } from "@/components/ui/FieldErrorText";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LoanLeadApplicantInput, LoanLeadApplicantZodSchema } from "@/components/validations/loan-lead.validation";
import { LOAN_NOTE_MAX, formatRate } from "@/lib/emi";
import { EMPLOYMENT_TYPE_LABEL } from "@/lib/enum";
import { formatCurrency } from "@/lib/formatCurrency";
import { siteConfig } from "@/lib/siteConfig";
import { IFinancePartnerCard, TEmploymentType } from "@/types";

export type TLoanTerms = {
  downPayment: number;
  tenureMonths: number;
  interestRate: number;
  loanAmount: number;
  estimatedEmi: number;
  totalInterest: number;
};

export type TLoanLeadApplicantDefaults = {
  fullName: string;
  phone: string;
  email: string;
  district: string;
};

type LoanLeadDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing: { id: string; title: string; price: number };
  terms: TLoanTerms;
  // the partner chosen in the calculator (sent as the preferred partner)
  partner: IFinancePartnerCard | null;
  applicant: TLoanLeadApplicantDefaults;
  onSent: () => void;
};

const EMPLOYMENT_TYPES = Object.keys(EMPLOYMENT_TYPE_LABEL) as TEmploymentType[];

// "+8801712345678" → "01712345678" for the form
const toLocalPhone = (phone: string) => phone.replace(/^\+?88/, "");

/*
 * "Apply for financing": the calculator's terms + the applicant's details.
 * Calls the action directly (dialog form, CONVENTIONS Part G).
 */
export function LoanLeadDialog({ open, onOpenChange, listing, terms, partner, applicant, onSent }: LoanLeadDialogProps) {
  const formId = useId();
  const [isPending, startTransition] = useTransition();

  const defaultValues: LoanLeadApplicantInput = {
    fullName: applicant.fullName,
    phone: toLocalPhone(applicant.phone),
    email: applicant.email,
    district: applicant.district,
    monthlyIncome: "",
    employmentType: "SALARIED",
    note: "",
    consent: false,
  };

  const form = useForm({
    defaultValues,
    validators: { onSubmit: LoanLeadApplicantZodSchema },
    onSubmit: async ({ value }) => {
      const parsed = LoanLeadApplicantZodSchema.parse(value);

      startTransition(async () => {
        const result = await createLoanLeadAction({
          listingId: listing.id,
          ...(partner && { preferredPartnerId: partner.id }),
          downPayment: terms.downPayment,
          tenureMonths: terms.tenureMonths,
          interestRate: terms.interestRate,
          fullName: parsed.fullName,
          phone: parsed.phone,
          ...(parsed.email && { email: parsed.email }),
          ...(parsed.district && { district: parsed.district }),
          ...(parsed.monthlyIncome && { monthlyIncome: Number(parsed.monthlyIncome) }),
          employmentType: parsed.employmentType,
          ...(parsed.note && { note: parsed.note }),
          consent: true,
        });

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        toast.success(result.message);
        onOpenChange(false);
        form.reset();
        onSent();
      });
    },
  });

  const summary = [
    { label: "Price", value: formatCurrency(listing.price) },
    { label: "Down payment", value: formatCurrency(terms.downPayment) },
    { label: "Loan", value: formatCurrency(terms.loanAmount) },
    { label: "Tenure", value: `${terms.tenureMonths} months` },
    { label: "Rate", value: `${formatRate(terms.interestRate)} a year` },
    { label: "Estimated EMI", value: formatCurrency(terms.estimatedEmi) },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Apply for financing</DialogTitle>
          <DialogDescription>
            {partner
              ? `We'll send your request to ${partner.name}. They'll contact you about "${listing.title}".`
              : `We'll pass your request to a finance partner, who will contact you about "${listing.title}".`}
          </DialogDescription>
        </DialogHeader>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 rounded-xl bg-muted/50 p-3 text-sm sm:grid-cols-3">
          {summary.map((item) => (
            <div key={item.label}>
              <dt className="text-xs text-muted-foreground">{item.label}</dt>
              <dd className="font-semibold tabular-nums">{item.value}</dd>
            </div>
          ))}
        </dl>

        <form
          id={formId}
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            form.handleSubmit();
          }}
          noValidate
          className="grid gap-4 sm:grid-cols-2"
        >
          <form.Field name="fullName">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor={`${formId}-name`}>
                    Full name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id={`${formId}-name`}
                    autoComplete="name"
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

          <form.Field name="phone">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <div className="space-y-2">
                  <Label htmlFor={`${formId}-phone`}>
                    Mobile <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id={`${formId}-phone`}
                    type="tel"
                    autoComplete="tel"
                    placeholder="01XXXXXXXXX"
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

          <form.Field name="email">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <div className="space-y-2">
                  <Label htmlFor={`${formId}-email`}>Email</Label>
                  <Input
                    id={`${formId}-email`}
                    type="email"
                    autoComplete="email"
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

          <form.Field name="employmentType">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={`${formId}-employment`}>
                  Employment <span className="text-destructive">*</span>
                </Label>
                <Select value={field.state.value} onValueChange={(value) => field.handleChange(value as TEmploymentType)}>
                  <SelectTrigger id={`${formId}-employment`} className="w-full">
                    <SelectValue>{EMPLOYMENT_TYPE_LABEL[field.state.value]}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {EMPLOYMENT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {EMPLOYMENT_TYPE_LABEL[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </form.Field>

          <form.Field name="monthlyIncome">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <div className="space-y-2">
                  <Label htmlFor={`${formId}-income`}>Monthly income ({siteConfig.currency.code})</Label>
                  <Input
                    id={`${formId}-income`}
                    inputMode="numeric"
                    placeholder="e.g. 50000"
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value.replace(/[^\d]/g, ""))}
                    onBlur={field.handleBlur}
                    aria-invalid={isInvalid}
                  />
                  <FieldErrorText show={isInvalid} errors={field.state.meta.errors} />
                </div>
              );
            }}
          </form.Field>

          <form.Field name="district">
            {(field) => (
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor={`${formId}-district`}>District</Label>
                <Input
                  id={`${formId}-district`}
                  placeholder="Where you live"
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="note">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor={`${formId}-note`}>Note for the partner</Label>
                  <Textarea
                    id={`${formId}-note`}
                    rows={2}
                    maxLength={LOAN_NOTE_MAX}
                    placeholder="e.g. Best time to call is after 6 pm"
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

          <form.Field name="consent">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <div className="space-y-1 sm:col-span-2">
                  <label className="flex cursor-pointer items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="mt-0.5 size-4 accent-primary"
                      checked={field.state.value}
                      onChange={(event) => {
                        field.handleChange(event.target.checked);
                        field.handleBlur();
                      }}
                      aria-invalid={isInvalid}
                    />
                    <span>
                      I agree that {siteConfig.name} may share these details with a finance partner so they can contact
                      me about this loan.
                    </span>
                  </label>
                  <FieldErrorText show={isInvalid} errors={field.state.meta.errors} />
                </div>
              );
            }}
          </form.Field>
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <form.Subscribe selector={(state) => [state.isSubmitting]}>
            {([isSubmitting]) => (
              <Button type="submit" form={formId} disabled={isSubmitting || isPending}>
                {isSubmitting || isPending ? <Loader2 className="animate-spin" /> : <Landmark />}
                Send request
              </Button>
            )}
          </form.Subscribe>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
