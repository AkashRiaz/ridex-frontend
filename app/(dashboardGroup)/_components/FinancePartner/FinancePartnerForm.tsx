"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { Landmark, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldErrorText } from "@/components/ui/FieldErrorText";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadField } from "@/components/shared/ImageUploadField";
import {
  FinancePartnerInput,
  FinancePartnerZodSchema,
} from "@/components/validations/finance-partner.validation";
import { LOAN_RATE_MAX_PERCENT, LOAN_TENURE_MAX_MONTHS, LOAN_TENURE_MIN_MONTHS } from "@/lib/emi";
import { IFinancePartner } from "@/types";
import { createFinancePartnerAction, updateFinancePartnerAction } from "../../_actions/financePartnerActions";

type FinancePartnerFormProps = {
  partner?: IFinancePartner;
  dashboardPath: string;
};

type TTextField = {
  name: Exclude<keyof FinancePartnerInput, "isActive" | "description">;
  label: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
  inputMode?: "decimal" | "numeric" | "email" | "tel" | "url";
  hint?: string;
};

const CONTACT_FIELDS: TTextField[] = [
  { name: "name", label: "Name", required: true, placeholder: "e.g. Swift Wheels Finance" },
  { name: "slug", label: "Slug", placeholder: "auto from name" },
  {
    name: "contactEmail",
    label: "Lead email",
    required: true,
    type: "email",
    inputMode: "email",
    placeholder: "leads@partner.com",
    hint: "Leads are emailed here when you send them.",
  },
  { name: "contactPhone", label: "Phone", type: "tel", inputMode: "tel" },
  { name: "website", label: "Website", type: "url", inputMode: "url", placeholder: "https://" },
];

const TERM_FIELDS: TTextField[] = [
  { name: "interestRateMin", label: "Lowest rate (% a year)", required: true, inputMode: "decimal", placeholder: "9.5" },
  { name: "interestRateMax", label: "Highest rate (% a year)", required: true, inputMode: "decimal", placeholder: "13" },
  {
    name: "minDownPaymentPercent",
    label: "Minimum down payment (%)",
    required: true,
    inputMode: "numeric",
    placeholder: "20",
  },
  {
    name: "maxTenureMonths",
    label: "Maximum tenure (months)",
    required: true,
    inputMode: "numeric",
    placeholder: "36",
    hint: `${LOAN_TENURE_MIN_MONTHS}–${LOAN_TENURE_MAX_MONTHS} months`,
  },
];

/*
 * Create (no partner) or update a finance partner.
 */
const FinancePartnerForm = ({ partner, dashboardPath }: FinancePartnerFormProps) => {
  const router = useRouter();
  const isEdit = Boolean(partner);

  const [state, formAction] = useActionState(isEdit ? updateFinancePartnerAction : createFinancePartnerAction, null);
  const [isPending, startTransition] = useTransition();
  const [logoFile, setLogoFile] = useState<File | null>(null);

  useEffect(() => {
    if (!state) return;

    if (state.success) {
      toast.success(state.message);
      if (!isEdit) router.push(`${dashboardPath}/finance-partners`);
      router.refresh();
    } else {
      toast.error(state.message || "Failed to save finance partner");
    }
  }, [state, isEdit, router, dashboardPath]);

  const defaultValues: FinancePartnerInput = {
    name: partner?.name ?? "",
    slug: partner?.slug ?? "",
    description: partner?.description ?? "",
    contactEmail: partner?.contactEmail ?? "",
    contactPhone: partner?.contactPhone ?? "",
    website: partner?.website ?? "",
    interestRateMin: partner ? String(partner.interestRateMin) : "",
    interestRateMax: partner ? String(partner.interestRateMax) : "",
    minDownPaymentPercent: partner ? String(partner.minDownPaymentPercent) : "",
    maxTenureMonths: partner ? String(partner.maxTenureMonths) : "",
    isActive: partner?.isActive ?? true,
  };

  const form = useForm({
    defaultValues,
    validators: { onSubmit: FinancePartnerZodSchema },
    onSubmit: async ({ value }) => {
      const formData = new FormData();
      if (partner) formData.append("id", partner.id);
      for (const [key, fieldValue] of Object.entries(value)) {
        formData.append(key, String(fieldValue));
      }
      if (logoFile) formData.append("logo", logoFile);

      startTransition(() => {
        formAction(formData);
      });
    },
  });

  const renderTextField = (config: TTextField) => (
    <form.Field key={config.name} name={config.name}>
      {(field) => {
        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

        return (
          <div className="space-y-2">
            <Label htmlFor={field.name}>
              {config.label} {config.required && <span className="text-destructive">*</span>}
            </Label>
            <Input
              id={field.name}
              type={config.type ?? "text"}
              inputMode={config.inputMode}
              placeholder={config.placeholder}
              className={config.name === "slug" ? "font-mono" : undefined}
              value={field.state.value}
              onChange={(e) =>
                field.handleChange(config.name === "slug" ? e.target.value.toLowerCase() : e.target.value)
              }
              onBlur={field.handleBlur}
              aria-invalid={isInvalid}
            />
            {config.hint && !isInvalid && <p className="text-xs text-muted-foreground">{config.hint}</p>}
            <FieldErrorText show={isInvalid} errors={field.state.meta.errors} />
          </div>
        );
      }}
    </form.Field>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Landmark className="size-5" />
          </div>
          <div>
            <CardTitle>{isEdit ? `Edit ${partner?.name}` : "Add Finance Partner"}</CardTitle>
            <CardDescription>
              Rates and limits show in the EMI calculator. Contact details stay private to admins.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-7"
          noValidate
        >
          <ImageUploadField
            label="Logo"
            currentImageUrl={partner?.logoUrl}
            file={logoFile}
            onFileChange={setLogoFile}
            disabled={isPending}
          />

          <div className="grid gap-4 md:grid-cols-2">{CONTACT_FIELDS.map(renderTextField)}</div>

          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold">Loan terms</legend>
            <p className="text-xs text-muted-foreground">
              Rates 0–{LOAN_RATE_MAX_PERCENT}%. Buyers who pick this partner must fit these limits.
            </p>
            <div className="grid gap-4 md:grid-cols-2">{TERM_FIELDS.map(renderTextField)}</div>
          </fieldset>

          <form.Field name="description">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Description</Label>
                  <Textarea
                    id={field.name}
                    rows={3}
                    maxLength={500}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    aria-invalid={isInvalid}
                  />
                  <FieldErrorText show={isInvalid} errors={field.state.meta.errors} />
                </div>
              );
            }}
          </form.Field>

          <form.Field name="isActive">
            {(field) => (
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="size-4 accent-primary"
                  checked={field.state.value}
                  onChange={(e) => field.handleChange(e.target.checked)}
                />
                Active (shown in the EMI calculator and can receive leads)
              </label>
            )}
          </form.Field>

          <div className="flex justify-end gap-3 border-t pt-5">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => {
                form.reset();
                setLogoFile(null);
              }}
            >
              Reset
            </Button>
            <form.Subscribe selector={(formState) => [formState.isSubmitting]}>
              {([isSubmitting]) => (
                <Button type="submit" disabled={isSubmitting || isPending} className="min-w-36">
                  {isSubmitting || isPending ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 size-4" />
                      {isEdit ? "Save partner" : "Add Partner"}
                    </>
                  )}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default FinancePartnerForm;
