"use client";

import { useActionState, useEffect, useTransition } from "react";
import { useForm } from "@tanstack/react-form";
import { Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FieldErrorText } from "@/components/ui/FieldErrorText";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  VerifyEmailInput,
  VerifyEmailZodSchema,
} from "@/components/validations/auth.validation";
import {
  resendEmailOtpAction,
  verifyEmailAction,
} from "../../_actions/authActions";
import OtpInput from "../shared/OtpInput";
import ResendCodeButton from "../shared/ResendCodeButton";

const VerifyEmailForm = ({ email }: { email?: string }) => {
  const [state, formAction] = useActionState(verifyEmailAction, null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (state && !state.success) {
      toast.error(state.message || "Verification failed");
    }
  }, [state]);

  const defaultValues: VerifyEmailInput = {
    email: email ?? "",
    otp: "",
  };

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: VerifyEmailZodSchema,
    },
    onSubmit: async ({ value }) => {
      const formData = new FormData();
      formData.append("email", value.email);
      formData.append("otp", value.otp);

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
      {/* Email — editable only when it did not come from the URL */}
      <form.Field name="email">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;

          return email ? (
            <p className="text-center text-sm text-muted-foreground">
              We sent a code to{" "}
              <span className="font-medium text-foreground">{email}</span>
            </p>
          ) : (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Email</Label>
              <Input
                id={field.name}
                type="email"
                autoComplete="email"
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
                autoFocus={Boolean(email)}
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
                <MailCheck className="mr-2 size-4" />
                Verify email
              </>
            )}
          </Button>
        )}
      </form.Subscribe>

      <form.Subscribe selector={(state) => state.values.email}>
        {(currentEmail) => (
          <ResendCodeButton
            startOnMount={Boolean(email)}
            onResend={() => resendEmailOtpAction(currentEmail)}
          />
        )}
      </form.Subscribe>
    </form>
  );
};

export default VerifyEmailForm;
