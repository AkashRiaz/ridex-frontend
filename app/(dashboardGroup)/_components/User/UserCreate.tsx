"use client";

import { useActionState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  CreateUserInput,
  CreateUserZodSchema,
} from "@/components/validations/user.validation";
import { CREATABLE_ROLES, ROLE_LABEL } from "@/lib/enum";
import { Role } from "@/types";
import { createUserAction } from "../../_actions/userActions";

type UserCreateProps = {
  actorRole: Role;
  // where to go after the user is created, e.g. "/admin-dashboard/users"
  redirectTo: string;
};

const UserCreate = ({ actorRole, redirectTo }: UserCreateProps) => {
  const router = useRouter();
  const [state, formAction] = useActionState(createUserAction, null);
  const [isPending, startTransition] = useTransition();

  const roles = CREATABLE_ROLES[actorRole] ?? [];

  useEffect(() => {
    if (!state) return;

    if (state.success) {
      toast.success(state.message);
      router.push(redirectTo);
      router.refresh();
    } else {
      toast.error(state.message || "Failed to create user");
    }
  }, [state, router, redirectTo]);

  const defaultValues: CreateUserInput = {
    name: "",
    email: "",
    phone: "",
    role: "MODERATOR",
  };

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: CreateUserZodSchema,
    },
    onSubmit: async ({ value }) => {
      const formData = new FormData();
      formData.append("name", value.name);
      formData.append("email", value.email);
      formData.append("phone", value.phone);
      formData.append("role", value.role);

      startTransition(() => {
        formAction(formData);
      });
    },
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <UserPlus className="size-5" />
          </div>
          <div>
            <CardTitle>Create User</CardTitle>
            <CardDescription>
              A temporary password is emailed. The user must change it on first login.
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
          <div className="grid gap-4 md:grid-cols-2">
            {/* Name */}
            <form.Field name="name">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>
                      Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id={field.name}
                      placeholder="Full name"
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

            {/* Role */}
            <form.Field name="role">
              {(field) => (
                <div className="space-y-2">
                  <Label>
                    Role <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) =>
                      field.handleChange((value ?? "MODERATOR") as CreateUserInput["role"])
                    }
                  >
                    <SelectTrigger className="w-full" aria-label="Role">
                      <SelectValue>{ROLE_LABEL[field.state.value]}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {ROLE_LABEL[role]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldErrorText
                    show={field.state.meta.isTouched && !field.state.meta.isValid}
                    errors={field.state.meta.errors}
                  />
                </div>
              )}
            </form.Field>

            {/* Email */}
            <form.Field name="email">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id={field.name}
                      type="email"
                      placeholder="name@example.com"
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

          <div className="flex justify-end gap-3 border-t pt-5">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => form.reset()}
            >
              Reset
            </Button>

            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  disabled={!canSubmit || isSubmitting || isPending}
                  className="min-w-40"
                >
                  {isSubmitting || isPending ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 size-4" />
                      Create User
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

export default UserCreate;
