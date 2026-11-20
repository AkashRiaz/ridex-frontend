"use client";

import { useActionState, useEffect, useTransition } from "react";
import { useForm } from "@tanstack/react-form";
import { KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FieldErrorText } from "@/components/ui/FieldErrorText";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ForgotPasswordInput,
  ForgotPasswordZodSchema,
} from "@/components/validations/auth.validation";
import { forgotPasswordAction } from "../../_actions/authActions";

const ForgotPasswordForm = () => {
  const [state, formAction] = useActionState(forgotPasswordAction, null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (state && !state.success) {
      toast.error(state.message || "Could not send the reset code");
    }
  }, [state]);

  const defaultValues: ForgotPasswordInput = { identifier: "" };

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: ForgotPasswordZodSchema,
    },
    onSubmit: async ({ value }) => {
      const formData = new FormData();
      formData.append("identifier", value.identifier);

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
                placeholder="you@example.com or 01XXXXXXXXX"
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
                Sending code...
              </>
            ) : (
              <>
                <KeyRound className="mr-2 size-4" />
                Send reset code
              </>
            )}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
};

export default ForgotPasswordForm;
