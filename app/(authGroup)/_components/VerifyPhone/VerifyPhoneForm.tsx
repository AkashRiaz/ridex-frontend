"use client";

import { useActionState, useEffect, useTransition } from "react";
import { useForm } from "@tanstack/react-form";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FieldErrorText } from "@/components/ui/FieldErrorText";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VerifyPhoneFormZodSchema } from "@/components/validations/auth.validation";
import {
  sendPhoneOtpAction,
  verifyPhoneOtpAction,
} from "../../_actions/authActions";
import OtpInput from "../shared/OtpInput";
import ResendCodeButton from "../shared/ResendCodeButton";

const VerifyPhoneForm = ({ phone }: { phone?: string }) => {
  const [state, formAction] = useActionState(verifyPhoneOtpAction, null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (state && !state.success) {
      toast.error(state.message || "Verification failed");
    }
  }, [state]);

  const form = useForm({
    defaultValues: {
      phone: phone ?? "",
      otp: "",
    },
    validators: {
      onSubmit: VerifyPhoneFormZodSchema,
    },
    onSubmit: async ({ value }) => {
      const formData = new FormData();
      formData.append("phone", value.phone);
      formData.append("otp", value.otp);
      formData.append("purpose", "VERIFY");

      startTransition(() => {
        formAction(formData);
      });
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-6"
      noValidate
    >
      <form.Field name="phone">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;

          return phone ? (
            <p className="text-center text-sm text-muted-foreground">
              We sent a code by SMS to{" "}
              <span className="font-medium text-foreground">{phone}</span>
            </p>
          ) : (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Phone number</Label>
              <Input
                id={field.name}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="01XXXXXXXXX"
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

      <form.Field name="otp">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;

          return (
            <div className="space-y-2">
              <OtpInput
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                invalid={isInvalid}
                autoFocus={Boolean(phone)}
              />
              <div className="text-center">
                <FieldErrorText show={isInvalid} errors={field.state.meta.errors} />
              </div>
            </div>
          );
        }}
      </form.Field>

      <form.Subscribe selector={(state) => [state.isSubmitting]}>
        {([isSubmitting]) => (
          <Button
            type="submit"
            className="h-10 w-full"
            disabled={isSubmitting || isPending}
          >
            {isSubmitting || isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <ShieldCheck className="mr-2 size-4" />
                Verify phone
              </>
            )}
          </Button>
        )}
      </form.Subscribe>

      <form.Subscribe selector={(state) => state.values.phone}>
        {(currentPhone) => (
          <ResendCodeButton
            startOnMount={Boolean(phone)}
            onResend={() => sendPhoneOtpAction(currentPhone, "VERIFY")}
          />
        )}
      </form.Subscribe>
    </form>
  );
};

export default VerifyPhoneForm;
