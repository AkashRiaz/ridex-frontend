"use client";

import { useActionState, useEffect, useTransition } from "react";
import { useForm } from "@tanstack/react-form";
import { Loader2, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FieldErrorText } from "@/components/ui/FieldErrorText";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ResetPasswordInput,
  ResetPasswordZodSchema,
} from "@/components/validations/auth.validation";
import {
  resendForgotPasswordOtpAction,
  resetPasswordAction,
} from "../../_actions/authActions";
import OtpInput from "../shared/OtpInput";
import PasswordInput from "../shared/PasswordInput";
import ResendCodeButton from "../shared/ResendCodeButton";

const ResetPasswordForm = ({ identifier }: { identifier?: string }) => {
  const [state, formAction] = useActionState(resetPasswordAction, null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (state && !state.success) {
      toast.error(state.message || "Could not reset the password");
    }
  }, [state]);

  const defaultValues: ResetPasswordInput = {
    identifier: identifier ?? "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  };

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: ResetPasswordZodSchema,
    },
    onSubmit: async ({ value }) => {
      const formData = new FormData();
      formData.append("identifier", value.identifier);
      formData.append("otp", value.otp);
      formData.append("newPassword", value.newPassword);
      formData.append("confirmPassword", value.confirmPassword);

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
      className="space-y-5"
      noValidate
    >
      {!identifier && (
        <form.Field name="identifier">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Email or phone</Label>
                <Input
                  id={field.name}
                  autoComplete="username"
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
      )}

      <form.Field name="otp">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;

          return (
            <div className="space-y-2">
              <Label className="block text-center">Reset code</Label>
              <OtpInput
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                invalid={isInvalid}
                autoFocus={Boolean(identifier)}
              />
              <div className="text-center">
                <FieldErrorText show={isInvalid} errors={field.state.meta.errors} />
              </div>
            </div>
          );
        }}
      </form.Field>

      <form.Field name="newPassword">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;

          return (
            <div className="space-y-2">
              <Label htmlFor={field.name}>New password</Label>
              <PasswordInput
                id={field.name}
                autoComplete="new-password"
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

      <form.Field name="confirmPassword">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;

          return (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Confirm new password</Label>
              <PasswordInput
                id={field.name}
                autoComplete="new-password"
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
                Resetting...
              </>
            ) : (
              <>
                <LockKeyhole className="mr-2 size-4" />
                Reset password
              </>
            )}
          </Button>
        )}
      </form.Subscribe>

      <form.Subscribe selector={(state) => state.values.identifier}>
        {(currentIdentifier) => (
          <ResendCodeButton
            startOnMount={Boolean(identifier)}
            onResend={() => resendForgotPasswordOtpAction(currentIdentifier)}
          />
        )}
      </form.Subscribe>
    </form>
  );
};

export default ResetPasswordForm;
