"use client";

import { useActionState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useForm } from "@tanstack/react-form";
import { Loader2, LogIn } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FieldErrorText } from "@/components/ui/FieldErrorText";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  LoginInput,
  LoginZodSchema,
} from "@/components/validations/auth.validation";
import { loginAction } from "../../_actions/authActions";
import PasswordInput from "../shared/PasswordInput";

const LoginForm = ({ redirectTo }: { redirectTo?: string }) => {
  const [state, formAction] = useActionState(loginAction, null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (state && !state.success) {
      toast.error(state.message || "Login failed");
    }
  }, [state]);

  const defaultValues: LoginInput = {
    identifier: "",
    password: "",
  };

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: LoginZodSchema,
    },
    onSubmit: async ({ value }) => {
      const formData = new FormData();
      formData.append("identifier", value.identifier);
      formData.append("password", value.password);
      formData.append("redirectTo", redirectTo ?? "");

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
      {/* Email or phone */}
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
                aria-describedby={isInvalid ? `${field.name}-error` : undefined}
              />
              <FieldErrorText
                id={`${field.name}-error`}
                show={isInvalid}
                errors={field.state.meta.errors}
              />
            </div>
          );
        }}
      </form.Field>

      {/* Password */}
      <form.Field name="password">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;

          return (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={field.name}>Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <PasswordInput
                id={field.name}
                autoComplete="current-password"
                placeholder="Your password"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                aria-invalid={isInvalid}
                aria-describedby={isInvalid ? `${field.name}-error` : undefined}
              />
              <FieldErrorText
                id={`${field.name}-error`}
                show={isInvalid}
                errors={field.state.meta.errors}
              />
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
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="mr-2 size-4" />
                Sign in
              </>
            )}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
};

export default LoginForm;
