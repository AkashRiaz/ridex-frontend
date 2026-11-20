"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { Loader2, Save } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  UpdateProfileInput,
  UpdateProfileZodSchema,
} from "@/components/validations/user.validation";
import { BD_DIVISIONS, GENDER_LABEL } from "@/lib/enum";
import { Gender, IUser } from "@/types";
import { updateMyProfileAction } from "../../_actions/profileActions";
import AvatarUpload from "./AvatarUpload";

const toDateInput = (value: string | null) =>
  value ? new Date(value).toISOString().slice(0, 10) : "";

const ProfileForm = ({ user }: { user: IUser }) => {
  const router = useRouter();
  const [state, formAction] = useActionState(updateMyProfileAction, null);
  const [isPending, startTransition] = useTransition();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    if (!state) return;

    if (state.success) {
      toast.success(state.message);
      router.refresh();
    } else {
      toast.error(state.message || "Failed to update profile");
    }
  }, [state, router]);

  const defaultValues: UpdateProfileInput = {
    name: user.name,
    bio: user.bio ?? "",
    gender: user.gender ?? "",
    dateOfBirth: toDateInput(user.dateOfBirth),
    division: user.division ?? "",
    district: user.district ?? "",
    area: user.area ?? "",
  };

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: UpdateProfileZodSchema,
    },
    onSubmit: async ({ value }) => {
      const formData = new FormData();
      formData.append("name", value.name);
      formData.append("bio", value.bio);
      formData.append("gender", value.gender);
      formData.append("dateOfBirth", value.dateOfBirth);
      formData.append("division", value.division);
      formData.append("district", value.district);
      formData.append("area", value.area);

      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      startTransition(() => {
        formAction(formData);
      });
    },
  });

  // After a successful save, router.refresh() changes user.updatedAt and
  // ProfileView remounts this form (key), which also clears avatarFile.

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-7"
      noValidate
    >
      <AvatarUpload
        name={user.name}
        currentImageUrl={user.imageUrl}
        file={avatarFile}
        onFileChange={setAvatarFile}
        disabled={isPending}
      />

      <div className="grid gap-4 md:grid-cols-2">
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

        {/* Gender */}
        <form.Field name="gender">
          {(field) => (
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select
                value={field.state.value}
                onValueChange={(value) => field.handleChange(value ?? "")}
              >
                <SelectTrigger className="w-full" aria-label="Gender">
                  <SelectValue placeholder="Select gender">
                    {field.state.value
                      ? GENDER_LABEL[field.state.value as Gender]
                      : "Select gender"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(GENDER_LABEL) as Gender[]).map((gender) => (
                    <SelectItem key={gender} value={gender}>
                      {GENDER_LABEL[gender]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </form.Field>

        {/* Date of birth */}
        <form.Field name="dateOfBirth">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Date of birth</Label>
                <Input
                  id={field.name}
                  type="date"
                  max={new Date().toISOString().slice(0, 10)}
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

        {/* Division */}
        <form.Field name="division">
          {(field) => (
            <div className="space-y-2">
              <Label>Division</Label>
              <Select
                value={field.state.value}
                onValueChange={(value) => field.handleChange(value ?? "")}
              >
                <SelectTrigger className="w-full" aria-label="Division">
                  <SelectValue placeholder="Select division">
                    {field.state.value || "Select division"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {BD_DIVISIONS.map((division) => (
                    <SelectItem key={division} value={division}>
                      {division}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </form.Field>

        {/* District */}
        <form.Field name="district">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <div className="space-y-2">
                <Label htmlFor={field.name}>District</Label>
                <Input
                  id={field.name}
                  placeholder="e.g. Dhaka"
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

        {/* Area */}
        <form.Field name="area">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Area</Label>
                <Input
                  id={field.name}
                  placeholder="e.g. Mirpur"
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

        {/* Bio */}
        <form.Field name="bio">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor={field.name}>Bio</Label>
                <Textarea
                  id={field.name}
                  placeholder="Tell buyers and riders a little about yourself..."
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  maxLength={500}
                  rows={4}
                  aria-invalid={isInvalid}
                />
                <div className="flex justify-between">
                  <FieldErrorText show={isInvalid} errors={field.state.meta.errors} />
                  <span className="ml-auto text-xs text-muted-foreground">
                    {field.state.value.length}/500
                  </span>
                </div>
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
          onClick={() => {
            form.reset();
            setAvatarFile(null);
          }}
        >
          Reset
        </Button>

        <form.Subscribe selector={(state) => [state.isSubmitting]}>
          {([isSubmitting]) => (
            <Button
              type="submit"
              disabled={isSubmitting || isPending}
              className="min-w-36"
            >
              {isSubmitting || isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 size-4" />
                  Save changes
                </>
              )}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
};

export default ProfileForm;
