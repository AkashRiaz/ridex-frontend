"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { Loader2, Lock, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FieldErrorText } from "@/components/ui/FieldErrorText";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DealerVerificationInput,
  DealerVerificationZodSchema,
  IdVerificationInput,
  IdVerificationZodSchema,
} from "@/components/validations/verification.validation";
import { BD_DIVISIONS } from "@/lib/bdLocations";
import { compressImage } from "@/lib/compressImage";
import { TDocumentKind, TVerificationType } from "@/types";
import { submitVerificationAction } from "../../_actions/verificationActions";
import { DocumentPicker, TDocumentFiles, VERIFICATION_DOCUMENTS, getMissingDocuments } from "./DocumentPicker";

/*
 * Shared submit: compress photos, keep documentKinds[i] aligned with documents[i].
 */
const useVerificationSubmit = (type: TVerificationType) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [files, setFiles] = useState<TDocumentFiles>({});
  const [showDocErrors, setShowDocErrors] = useState(false);

  const submit = (fields: Record<string, string>) => {
    if (getMissingDocuments(type, files).length > 0) {
      setShowDocErrors(true);
      toast.error("Add every required document");
      return;
    }

    startTransition(async () => {
      const kinds: TDocumentKind[] = [];
      const formData = new FormData();

      for (const rule of VERIFICATION_DOCUMENTS[type]) {
        for (const file of files[rule.kind] ?? []) {
          kinds.push(rule.kind);
          formData.append("documents", await compressImage(file));
        }
      }

      formData.append("data", JSON.stringify({ type, ...fields, documentKinds: kinds }));

      const result = await submitVerificationAction(formData);

      if (result.success) {
        toast.success(result.message);
        setFiles({});
        router.refresh();
      } else toast.error(result.message);
    });
  };

  return { isPending, files, setFiles, showDocErrors, submit };
};

const PrivacyNote = () => (
  <p className="flex items-start gap-2 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
    <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
    Documents are stored privately, seen only by RideX admins, and deleted 30 days after the decision.
  </p>
);

// ============================================
// ID
// ============================================

export function IdVerificationForm({ defaultName }: { defaultName: string }) {
  const { isPending, files, setFiles, showDocErrors, submit } = useVerificationSubmit("ID");

  const form = useForm({
    defaultValues: { fullName: defaultName, nidNumber: "" } as IdVerificationInput,
    validators: { onSubmit: IdVerificationZodSchema },
    onSubmit: ({ value }) => submit({ fullName: value.fullName.trim(), nidNumber: value.nidNumber.trim() }),
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-5"
      noValidate
    >
      <div className="grid gap-4 md:grid-cols-2">
        <form.Field name="fullName">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <div className="space-y-2">
                <Label htmlFor="id-fullName">
                  Name on NID <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="id-fullName"
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                  aria-invalid={isInvalid}
                  autoComplete="name"
                />
                <FieldErrorText show={isInvalid} errors={field.state.meta.errors} />
              </div>
            );
          }}
        </form.Field>
        <form.Field name="nidNumber">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <div className="space-y-2">
                <Label htmlFor="id-nidNumber">
                  NID number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="id-nidNumber"
                  inputMode="numeric"
                  placeholder="10, 13 or 17 digits"
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value.replace(/\D/g, ""))}
                  onBlur={field.handleBlur}
                  aria-invalid={isInvalid}
                  autoComplete="off"
                />
                <p className="text-xs text-muted-foreground">Only the last 4 digits are kept.</p>
                <FieldErrorText show={isInvalid} errors={field.state.meta.errors} />
              </div>
            );
          }}
        </form.Field>
      </div>

      <DocumentPicker type="ID" files={files} onChange={setFiles} disabled={isPending} showErrors={showDocErrors} />
      <PrivacyNote />

      <Button type="submit" disabled={isPending}>
        {isPending ? <Loader2 className="animate-spin" /> : <Send />}
        Submit for review
      </Button>
    </form>
  );
}

// ============================================
// Dealer
// ============================================

export function DealerVerificationForm({
  defaults,
}: {
  defaults: { businessName: string; division: string; district: string; area: string };
}) {
  const { isPending, files, setFiles, showDocErrors, submit } = useVerificationSubmit("DEALER");

  const form = useForm({
    defaultValues: { tradeLicenseNumber: "", ...defaults } as DealerVerificationInput,
    validators: { onSubmit: DealerVerificationZodSchema },
    onSubmit: ({ value }) =>
      submit({
        businessName: value.businessName.trim(),
        tradeLicenseNumber: value.tradeLicenseNumber.trim(),
        division: value.division,
        district: value.district,
        ...(value.area.trim() && { area: value.area.trim() }),
      }),
  });

  const textField = (name: "businessName" | "tradeLicenseNumber" | "area", label: string, required: boolean, placeholder?: string) => (
    <form.Field name={name}>
      {(field) => {
        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
        return (
          <div className="space-y-2">
            <Label htmlFor={`dealer-${name}`}>
              {label} {required && <span className="text-destructive">*</span>}
            </Label>
            <Input
              id={`dealer-${name}`}
              placeholder={placeholder}
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
  );

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-5"
      noValidate
    >
      <div className="grid gap-4 md:grid-cols-2">
        {textField("businessName", "Business name", true, "e.g. Dhaka Moto House")}
        {textField("tradeLicenseNumber", "Trade license number", true, "e.g. TRAD/DNCC/012345")}

        <form.Field name="division">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <div className="space-y-2">
                <Label>
                  Showroom division <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => {
                    if (!value) return;
                    field.handleChange(value);
                    form.setFieldValue("district", "");
                  }}
                >
                  <SelectTrigger className="w-full" aria-label="Division" aria-invalid={isInvalid}>
                    <SelectValue>{field.state.value || "Select division"}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {BD_DIVISIONS.map((division) => (
                      <SelectItem key={division.name} value={division.name}>
                        {division.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldErrorText show={isInvalid} errors={field.state.meta.errors} />
              </div>
            );
          }}
        </form.Field>

        <form.Subscribe selector={(state) => state.values.division}>
          {(division) => (
            <form.Field name="district">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                const districts = BD_DIVISIONS.find((item) => item.name === division)?.districts ?? [];
                return (
                  <div className="space-y-2">
                    <Label>
                      Showroom district <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={field.state.value}
                      disabled={!division}
                      onValueChange={(value) => {
                        if (value) field.handleChange(value);
                      }}
                    >
                      <SelectTrigger className="w-full" aria-label="District" aria-invalid={isInvalid}>
                        <SelectValue>
                          {field.state.value || (division ? "Select district" : "Select a division first")}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {districts.map((district) => (
                          <SelectItem key={district.name} value={district.name}>
                            {district.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldErrorText show={isInvalid} errors={field.state.meta.errors} />
                  </div>
                );
              }}
            </form.Field>
          )}
        </form.Subscribe>

        {textField("area", "Area / street", false, "e.g. Tejgaon")}
      </div>

      <DocumentPicker type="DEALER" files={files} onChange={setFiles} disabled={isPending} showErrors={showDocErrors} />
      <PrivacyNote />

      <Button type="submit" disabled={isPending}>
        {isPending ? <Loader2 className="animate-spin" /> : <Send />}
        Submit for review
      </Button>
    </form>
  );
}
