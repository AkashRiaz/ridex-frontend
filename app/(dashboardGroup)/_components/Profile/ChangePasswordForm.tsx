"use client";

import { useActionState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FieldErrorText } from "@/components/ui/FieldErrorText";
import { Label } from "@/components/ui/label";
import {
  ChangePasswordInput,
  ChangePasswordZodSchema,
} from "@/components/validations/auth.validation";
import PasswordInput from "@/app/(authGroup)/_components/shared/PasswordInput";
import { changePasswordAction } from "../../_actions/profileActions";

type ChangePasswordFormProps = {
  // Google-only accounts have no password to confirm yet
  hasPassword: boolean;
  // set when the account must change its temporary password
  redirectOnSuccess?: string;
};

const ChangePasswordForm = ({
  hasPassword,
  redirectOnSuccess,
}: ChangePasswordFormProps) => {
  const router = useRouter();
  const [state, formAction] = useActionState(changePasswordAction, null);
  const [isPending, startTransition] = useTransition();

  const defaultValues: ChangePasswordInput = {
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  };

  const schema = hasPassword
    ? ChangePasswordZodSchema.refine((data) => data.oldPassword.length > 0, {
        message: "Current password is required",
        path: ["oldPassword"],
      })
    : ChangePasswordZodSchema;

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: schema,
    },
    onSubmit: async ({ value }) => {
      const formData = new FormData();
      formData.append("oldPassword", value.oldPassword);
      formData.append("newPassword", value.newPassword);
      formData.append("confirmPassword", value.confirmPassword);

      startTransition(() => {
        formAction(formData);
      });
    },
  });

  useEffect(() => {
    if (!state) return;

    if (state.success) {
      toast.success(state.message);
      form.reset();

      if (redirectOnSuccess) {
        router.push(redirectOnSuccess);
      }

      router.refresh();
    } else {
      toast.error(state.message || "Failed to change password");
    }
  }, [state, form, redirectOnSuccess, router]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="max-w-md space-y-5"
      noValidate
    >
      {hasPassword && (
        <form.Field name="oldPassword">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Current password</Label>
                <PasswordInput
                  id={field.name}
                  autoComplete="current-password"
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
              <p className="text-xs text-muted-foreground">
                At least 8 characters with upper and lower case letters, a number and a symbol.
              </p>
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

      <p className="text-xs text-muted-foreground">
        Changing your password signs you out on every other device.
      </p>

      <form.Subscribe selector={(state) => [state.isSubmitting]}>
        {([isSubmitting]) => (
          <Button type="submit" disabled={isSubmitting || isPending}>
            {isSubmitting || isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <KeyRound className="mr-2 size-4" />
                {hasPassword ? "Change password" : "Set password"}
              </>
            )}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
};

export default ChangePasswordForm;
