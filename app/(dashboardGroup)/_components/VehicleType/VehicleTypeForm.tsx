"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { Layers, Loader2, Save } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadField } from "@/components/shared/ImageUploadField";
import {
  VehicleTypeInput,
  VehicleTypeZodSchema,
} from "@/components/validations/vehicle-type.validation";
import { IVehicleType } from "@/types";
import {
  createVehicleTypeAction,
  updateVehicleTypeAction,
} from "../../_actions/vehicleTypeActions";

type VehicleTypeFormProps = {
  vehicleType?: IVehicleType;
  // e.g. "/admin-dashboard"
  dashboardPath: string;
};

/*
 * Create (no vehicleType) or update the basic fields of a vehicle type.
 * The attribute schema is edited separately in AttributeSchemaBuilder.
 */
const VehicleTypeForm = ({ vehicleType, dashboardPath }: VehicleTypeFormProps) => {
  const router = useRouter();
  const isEdit = Boolean(vehicleType);

  const [state, formAction] = useActionState(
    isEdit ? updateVehicleTypeAction : createVehicleTypeAction,
    null,
  );
  const [isPending, startTransition] = useTransition();
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (!state) return;

    if (state.success) {
      toast.success(state.message);

      if (!isEdit && state.data) {
        // continue with the attribute schema
        router.push(`${dashboardPath}/vehicle-types/${state.data.id}`);
      }

      router.refresh();
    } else {
      toast.error(state.message || "Failed to save vehicle type");
    }
  }, [state, isEdit, router, dashboardPath]);

  const defaultValues: VehicleTypeInput = {
    name: vehicleType?.name ?? "",
    slug: vehicleType?.slug ?? "",
    description: vehicleType?.description ?? "",
    icon: vehicleType?.icon ?? "",
    sortOrder: String(vehicleType?.sortOrder ?? 0),
    isActive: vehicleType?.isActive ?? true,
  };

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: VehicleTypeZodSchema,
    },
    onSubmit: async ({ value }) => {
      const formData = new FormData();
      if (vehicleType) formData.append("id", vehicleType.id);
      formData.append("name", value.name);
      formData.append("slug", value.slug);
      formData.append("description", value.description);
      formData.append("icon", value.icon);
      formData.append("sortOrder", value.sortOrder);
      formData.append("isActive", String(value.isActive));
      if (imageFile) formData.append("image", imageFile);

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
            <Layers className="size-5" />
          </div>
          <div>
            <CardTitle>{isEdit ? "Vehicle type details" : "Create Vehicle Type"}</CardTitle>
            <CardDescription>
              {isEdit
                ? "Name, slug and how it appears to buyers."
                : "After creating it you can define its spec attributes."}
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
          <ImageUploadField
            label="Cover image"
            aspect="wide"
            currentImageUrl={vehicleType?.imageUrl}
            file={imageFile}
            onFileChange={setImageFile}
            disabled={isPending}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <form.Field name="name">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>
                      Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id={field.name}
                      placeholder="e.g. Bike, Car, Scooter"
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

            <form.Field name="slug">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Slug</Label>
                    <Input
                      id={field.name}
                      placeholder="auto from name"
                      className="font-mono"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value.toLowerCase())}
                      onBlur={field.handleBlur}
                      aria-invalid={isInvalid}
                    />
                    <FieldErrorText show={isInvalid} errors={field.state.meta.errors} />
                    <p className="text-xs text-muted-foreground">Used in URLs, e.g. /listings?type=bike</p>
                  </div>
                );
              }}
            </form.Field>

            <form.Field name="icon">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Icon</Label>
                  <Input
                    id={field.name}
                    placeholder="bike, car, truck ..."
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                  <p className="text-xs text-muted-foreground">A lucide icon name</p>
                </div>
              )}
            </form.Field>

            <form.Field name="sortOrder">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Sort order</Label>
                    <Input
                      id={field.name}
                      type="number"
                      min={0}
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

            <form.Field name="description">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={field.name}>Description</Label>
                    <Textarea
                      id={field.name}
                      rows={3}
                      maxLength={500}
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

            <form.Field name="isActive">
              {(field) => (
                <label className="inline-flex cursor-pointer items-center gap-2 text-sm md:col-span-2">
                  <input
                    type="checkbox"
                    className="size-4 accent-primary"
                    checked={field.state.value}
                    onChange={(e) => field.handleChange(e.target.checked)}
                  />
                  Active (visible to buyers and sellers)
                </label>
              )}
            </form.Field>
          </div>

          <div className="flex justify-end gap-3 border-t pt-5">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => {
                form.reset();
                setImageFile(null);
              }}
            >
              Reset
            </Button>
            <form.Subscribe selector={(formState) => [formState.isSubmitting]}>
              {([isSubmitting]) => (
                <Button type="submit" disabled={isSubmitting || isPending} className="min-w-40">
                  {isSubmitting || isPending ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 size-4" />
                      {isEdit ? "Save details" : "Create Vehicle Type"}
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

export default VehicleTypeForm;
