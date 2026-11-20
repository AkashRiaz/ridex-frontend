"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { Loader2, Save, Tag } from "lucide-react";
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
import { BrandInput, BrandZodSchema } from "@/components/validations/brand.validation";
import { cn } from "@/lib/utils";
import { IBrand, IVehicleType } from "@/types";
import { createBrandAction, updateBrandAction } from "../../_actions/brandActions";

type BrandFormProps = {
  brand?: IBrand;
  vehicleTypes: IVehicleType[];
  dashboardPath: string;
};

/*
 * Create (no brand) or update a brand.
 */
const BrandForm = ({ brand, vehicleTypes, dashboardPath }: BrandFormProps) => {
  const router = useRouter();
  const isEdit = Boolean(brand);

  const [state, formAction] = useActionState(
    isEdit ? updateBrandAction : createBrandAction,
    null,
  );
  const [isPending, startTransition] = useTransition();
  const [logoFile, setLogoFile] = useState<File | null>(null);

  useEffect(() => {
    if (!state) return;

    if (state.success) {
      toast.success(state.message);
      if (!isEdit) router.push(`${dashboardPath}/brands`);
      router.refresh();
    } else {
      toast.error(state.message || "Failed to save brand");
    }
  }, [state, isEdit, router, dashboardPath]);

  const defaultValues: BrandInput = {
    name: brand?.name ?? "",
    slug: brand?.slug ?? "",
    country: brand?.country ?? "",
    description: brand?.description ?? "",
    vehicleTypeIds:
      brand?.vehicleTypes.map((vehicleType) => vehicleType.id) ??
      (vehicleTypes.length === 1 ? [vehicleTypes[0].id] : []),
    isPopular: brand?.isPopular ?? false,
    isActive: brand?.isActive ?? true,
  };

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: BrandZodSchema,
    },
    onSubmit: async ({ value }) => {
      const formData = new FormData();
      if (brand) formData.append("id", brand.id);
      formData.append("name", value.name);
      formData.append("slug", value.slug);
      formData.append("country", value.country);
      formData.append("description", value.description);
      for (const vehicleTypeId of value.vehicleTypeIds) {
        formData.append("vehicleTypeIds", vehicleTypeId);
      }
      formData.append("isPopular", String(value.isPopular));
      formData.append("isActive", String(value.isActive));
      if (logoFile) formData.append("logo", logoFile);

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
            <Tag className="size-5" />
          </div>
          <div>
            <CardTitle>{isEdit ? `Edit ${brand?.name}` : "Create Brand"}</CardTitle>
            <CardDescription>Manufacturer shown in listing forms, filters and search.</CardDescription>
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
            label="Logo"
            currentImageUrl={brand?.logoUrl}
            file={logoFile}
            onFileChange={setLogoFile}
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
                      placeholder="e.g. Yamaha"
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
                  </div>
                );
              }}
            </form.Field>

            <form.Field name="country">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Country</Label>
                    <Input
                      id={field.name}
                      placeholder="e.g. Japan"
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

            {/* Vehicle types */}
            <form.Field name="vehicleTypeIds">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <fieldset className="space-y-2">
                    <legend className="mb-2 text-sm font-medium">
                      Vehicle types <span className="text-destructive">*</span>
                    </legend>
                    {vehicleTypes.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Create a vehicle type first.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {vehicleTypes.map((vehicleType) => {
                          const isChecked = field.state.value.includes(vehicleType.id);

                          return (
                            <label
                              key={vehicleType.id}
                              className={cn(
                                "inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition",
                                "has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/40",
                                isChecked ? "border-primary bg-primary/10" : "hover:bg-muted",
                              )}
                            >
                              <input
                                type="checkbox"
                                className="size-3.5 accent-primary"
                                checked={isChecked}
                                onChange={(e) => {
                                  field.handleChange(
                                    e.target.checked
                                      ? [...field.state.value, vehicleType.id]
                                      : field.state.value.filter((id) => id !== vehicleType.id),
                                  );
                                  field.handleBlur();
                                }}
                              />
                              {vehicleType.name}
                            </label>
                          );
                        })}
                      </div>
                    )}
                    <FieldErrorText show={isInvalid} errors={field.state.meta.errors} />
                  </fieldset>
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
                      maxLength={1000}
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

            <div className="flex flex-wrap gap-6 md:col-span-2">
              <form.Field name="isPopular">
                {(field) => (
                  <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="size-4 accent-primary"
                      checked={field.state.value}
                      onChange={(e) => field.handleChange(e.target.checked)}
                    />
                    Popular (featured in filters and the homepage)
                  </label>
                )}
              </form.Field>
              <form.Field name="isActive">
                {(field) => (
                  <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="size-4 accent-primary"
                      checked={field.state.value}
                      onChange={(e) => field.handleChange(e.target.checked)}
                    />
                    Active
                  </label>
                )}
              </form.Field>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t pt-5">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => {
                form.reset();
                setLogoFile(null);
              }}
            >
              Reset
            </Button>
            <form.Subscribe selector={(formState) => [formState.isSubmitting]}>
              {([isSubmitting]) => (
                <Button type="submit" disabled={isSubmitting || isPending} className="min-w-36">
                  {isSubmitting || isPending ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 size-4" />
                      {isEdit ? "Save brand" : "Create Brand"}
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

export default BrandForm;
