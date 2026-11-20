"use client";

import { useActionState, useEffect, useTransition } from "react";
import { useForm } from "@tanstack/react-form";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FieldErrorText } from "@/components/ui/FieldErrorText";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  RegisterInput,
  RegisterZodSchema,
} from "@/components/validations/auth.validation";
import { SELF_REGISTER_ROLES } from "@/lib/enum";
import { cn } from "@/lib/utils";
import { registerAction } from "../../_actions/authActions";
import PasswordInput from "../shared/PasswordInput";

const RegisterForm = () => {
  const [state, formAction] = useActionState(registerAction, null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (state && !state.success) {
      toast.error(state.message || "Registration failed");
    }
  }, [state]);

  const defaultValues: RegisterInput = {
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "BUYER",
  };

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: RegisterZodSchema,
    },
    onSubmit: async ({ value }) => {
      const formData = new FormData();
      formData.append("name", value.name);
      formData.append("email", value.email);
      formData.append("phone", value.phone);
      formData.append("password", value.password);
      formData.append("confirmPassword", value.confirmPassword);
      formData.append("role", value.role);

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
      {/* Role */}
      <form.Field name="role">
        {(field) => (
          <fieldset className="space-y-2">
            <legend className="mb-2 text-sm font-medium">I want to</legend>
            <div className="grid grid-cols-3 gap-2" role="radiogroup">
              {SELF_REGISTER_ROLES.map((role) => {
                const isSelected = field.state.value === role.value;

                return (
                  <label
                    key={role.value}
                    className={cn(
                      "flex cursor-pointer flex-col rounded-xl border p-3 text-left transition",
                      "has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/40",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted",
                    )}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role.value}
                      checked={isSelected}
                      onChange={() => field.handleChange(role.value)}
                      className="sr-only"
                    />
                    <span className="text-sm font-semibold">{role.label}</span>
                    <span className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
                      {role.description}
                    </span>
                  </label>
                );
              })}
            </div>
            <FieldErrorText
              show={field.state.meta.isTouched && !field.state.meta.isValid}
              errors={field.state.meta.errors}
            />
          </fieldset>
        )}
      </form.Field>

      {/* Name */}
      <form.Field name="name">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;

          return (
            <div className="space-y-2">
              <Label htmlFor={field.name}>
                Full name <span className="text-destructive">*</span>
              </Label>
              <Input
                id={field.name}
                autoComplete="name"
                placeholder="Your name"
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

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Email */}
        <form.Field name="email">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Email</Label>
                <Input
                  id={field.name}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
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

        {/* Phone */}
        <form.Field name="phone">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Phone</Label>
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
      </div>
      <p className="-mt-2 text-xs text-muted-foreground">
        Enter an email, a phone number, or both. We&apos;ll send a code to verify it.
      </p>

      {/* Password */}
      <form.Field name="password">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;

          return (
            <div className="space-y-2">
              <Label htmlFor={field.name}>
                Password <span className="text-destructive">*</span>
              </Label>
              <PasswordInput
                id={field.name}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                aria-invalid={isInvalid}
              />
              <FieldErrorText show={isInvalid} errors={field.state.meta.errors} />
              <p className="text-xs text-muted-foreground">
                Use upper and lower case letters, a number and a symbol.
              </p>
            </div>
          );
        }}
      </form.Field>

      {/* Confirm password */}
      <form.Field name="confirmPassword">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;

          return (
            <div className="space-y-2">
              <Label htmlFor={field.name}>
                Confirm password <span className="text-destructive">*</span>
              </Label>
              <PasswordInput
                id={field.name}
                autoComplete="new-password"
                placeholder="Repeat your password"
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
                Creating account...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 size-4" />
                Create account
              </>
            )}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
};

export default RegisterForm;
