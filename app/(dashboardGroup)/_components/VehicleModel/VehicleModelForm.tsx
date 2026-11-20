"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { Bike, Loader2, Save } from "lucide-react";
import Swal from "sweetalert2";
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
import { ImageUploadField } from "@/components/shared/ImageUploadField";
import {
  DynamicSpecFields,
  TSpecFormValues,
} from "@/components/dynamicForm/DynamicSpecFields";
import {
  specsToFormValues,
  validateSpecValues,
} from "@/components/dynamicForm/buildSpecSchema";
import {
  VehicleModelInput,
  VehicleModelZodSchema,
} from "@/components/validations/vehicle-model.validation";
import { IBrand, IVehicleModel, IVehicleType } from "@/types";
import {
  createVehicleModelAction,
  updateVehicleModelAction,
} from "../../_actions/vehicleModelActions";

type VehicleModelFormProps = {
  vehicleModel?: IVehicleModel;
  vehicleTypes: IVehicleType[];
  brands: IBrand[];
  dashboardPath: string;
};

const hasAnyValue = (values: TSpecFormValues) =>
  Object.values(values).some((value) => (Array.isArray(value) ? value.length > 0 : value !== ""));

const VehicleModelForm = ({
  vehicleModel,
  vehicleTypes,
  brands,
  dashboardPath,
}: VehicleModelFormProps) => {
  const router = useRouter();
  const isEdit = Boolean(vehicleModel);

  const [state, formAction] = useActionState(
    isEdit ? updateVehicleModelAction : createVehicleModelAction,
    null,
  );
  const [isPending, startTransition] = useTransition();
  const [imageFile, setImageFile] = useState<File | null>(null);

  const initialType =
    vehicleTypes.find((vehicleType) => vehicleType.id === vehicleModel?.vehicleTypeId) ??
    (vehicleTypes.length === 1 ? vehicleTypes[0] : undefined);

  const [specValues, setSpecValues] = useState<TSpecFormValues>(() =>
    specsToFormValues(initialType?.attributes ?? [], vehicleModel?.defaultSpecs),
  );
  const [specErrors, setSpecErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!state) return;

    if (state.success) {
      toast.success(state.message);
      if (!isEdit) router.push(`${dashboardPath}/vehicle-models`);
      router.refresh();
    } else {
      toast.error(state.message || "Failed to save model");
    }
  }, [state, isEdit, router, dashboardPath]);

  const defaultValues: VehicleModelInput = {
    vehicleTypeId: initialType?.id ?? "",
    brandId: vehicleModel?.brandId ?? "",
    name: vehicleModel?.name ?? "",
    slug: vehicleModel?.slug ?? "",
    yearFrom: vehicleModel?.yearFrom?.toString() ?? "",
    yearTo: vehicleModel?.yearTo?.toString() ?? "",
    isActive: vehicleModel?.isActive ?? true,
  };

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: VehicleModelZodSchema,
    },
    onSubmit: async ({ value }) => {
      const vehicleType = vehicleTypes.find((item) => item.id === value.vehicleTypeId);
      const specs = validateSpecValues(vehicleType?.attributes ?? [], specValues, {
        partial: true,
      });

      if (!specs.success) {
        setSpecErrors(specs.errors);
        toast.error(specs.message);
        return;
      }

      setSpecErrors({});

      const formData = new FormData();
      if (vehicleModel) formData.append("id", vehicleModel.id);
      formData.append("vehicleTypeId", value.vehicleTypeId);
      formData.append("brandId", value.brandId);
      formData.append("name", value.name);
      formData.append("slug", value.slug);
      formData.append("yearFrom", value.yearFrom);
      formData.append("yearTo", value.yearTo);
      formData.append("isActive", String(value.isActive));
      formData.append("defaultSpecs", JSON.stringify(specs.data));
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
            <Bike className="size-5" />
          </div>
          <div>
            <CardTitle>{isEdit ? `Edit ${vehicleModel?.name}` : "Create Model"}</CardTitle>
            <CardDescription>
              Default specs auto-fill the listing form when a seller picks this model.
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
          className="space-y-8"
          noValidate
        >
          <ImageUploadField
            label="Model photo"
            aspect="wide"
            currentImageUrl={vehicleModel?.imageUrl}
            file={imageFile}
            onFileChange={setImageFile}
            disabled={isPending}
          />

          <div className="grid gap-4 md:grid-cols-2">
            {/* 1. Vehicle type */}
            <form.Field name="vehicleTypeId">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                const selected = vehicleTypes.find((item) => item.id === field.state.value);

                return (
                  <div className="space-y-2">
                    <Label>
                      Vehicle type <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={field.state.value}
                      onValueChange={async (value) => {
                        if (!value || value === field.state.value) return;

                        if (hasAnyValue(specValues)) {
                          const confirmation = await Swal.fire({
                            title: "Change vehicle type?",
                            text: "Default specs belong to the vehicle type and will be cleared.",
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonText: "Change",
                            cancelButtonText: "Cancel",
                            reverseButtons: true,
                          });
                          if (!confirmation.isConfirmed) return;
                        }

                        const nextType = vehicleTypes.find((item) => item.id === value);
                        field.handleChange(value);
                        // the brand must support the new type
                        const currentBrand = brands.find(
                          (brand) => brand.id === form.getFieldValue("brandId"),
                        );
                        if (!currentBrand?.vehicleTypes.some((type) => type.id === value)) {
                          form.setFieldValue("brandId", "");
                        }
                        setSpecValues(specsToFormValues(nextType?.attributes ?? [], {}));
                        setSpecErrors({});
                      }}
                    >
                      <SelectTrigger className="w-full" aria-label="Vehicle type" aria-invalid={isInvalid}>
                        <SelectValue placeholder="Select vehicle type">
                          {selected?.name ?? "Select vehicle type"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {vehicleTypes.map((vehicleType) => (
                          <SelectItem key={vehicleType.id} value={vehicleType.id}>
                            {vehicleType.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldErrorText show={isInvalid} errors={field.state.meta.errors} />
                  </div>
                );
              }}
            </form.Field>

            {/* 2. Brand (only brands linked to the type) */}
            <form.Subscribe selector={(formState) => formState.values.vehicleTypeId}>
              {(vehicleTypeId) => {
                const availableBrands = brands.filter((brand) =>
                  brand.vehicleTypes.some((type) => type.id === vehicleTypeId),
                );

                return (
                  <form.Field name="brandId">
                    {(field) => {
                      const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                      const selected = brands.find((brand) => brand.id === field.state.value);

                      return (
                        <div className="space-y-2">
                          <Label>
                            Brand <span className="text-destructive">*</span>
                          </Label>
                          <Select
                            value={field.state.value}
                            onValueChange={(value) => field.handleChange(value ?? "")}
                            disabled={!vehicleTypeId}
                          >
                            <SelectTrigger className="w-full" aria-label="Brand" aria-invalid={isInvalid}>
                              <SelectValue placeholder="Select brand">
                                {selected?.name ??
                                  (vehicleTypeId ? "Select brand" : "Select a vehicle type first")}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {availableBrands.length === 0 ? (
                                <SelectItem value="__none__" disabled>
                                  No brands for this vehicle type
                                </SelectItem>
                              ) : (
                                availableBrands.map((brand) => (
                                  <SelectItem key={brand.id} value={brand.id}>
                                    {brand.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FieldErrorText show={isInvalid} errors={field.state.meta.errors} />
                        </div>
                      );
                    }}
                  </form.Field>
                );
              }}
            </form.Subscribe>

            <form.Field name="name">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>
                      Model name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id={field.name}
                      placeholder="e.g. R15 V4"
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

            {(["yearFrom", "yearTo"] as const).map((name) => (
              <form.Field key={name} name={name}>
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>
                        {name === "yearFrom" ? "Available from (year)" : "Available until (year)"}
                      </Label>
                      <Input
                        id={field.name}
                        inputMode="numeric"
                        placeholder={name === "yearFrom" ? "e.g. 2022" : "leave empty if still sold"}
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
            ))}

            <form.Field name="isActive">
              {(field) => (
                <label className="inline-flex cursor-pointer items-center gap-2 text-sm md:col-span-2">
                  <input
                    type="checkbox"
                    className="size-4 accent-primary"
                    checked={field.state.value}
                    onChange={(e) => field.handleChange(e.target.checked)}
                  />
                  Active (sellers can pick this model)
                </label>
              )}
            </form.Field>
          </div>

          {/* 3. Default specs from the vehicle type schema */}
          <form.Subscribe selector={(formState) => formState.values.vehicleTypeId}>
            {(vehicleTypeId) => {
              const vehicleType = vehicleTypes.find((item) => item.id === vehicleTypeId);

              return (
                <section className="space-y-4 border-t pt-6">
                  <div>
                    <h3 className="font-semibold">Default specs</h3>
                    <p className="text-sm text-muted-foreground">
                      All optional. Sellers can still change them per listing.
                    </p>
                  </div>
                  {vehicleType ? (
                    <DynamicSpecFields
                      attributes={vehicleType.attributes}
                      values={specValues}
                      errors={specErrors}
                      onChange={(key, value) => {
                        setSpecValues((current) => ({ ...current, [key]: value }));
                        setSpecErrors((current) => {
                          const next = { ...current };
                          delete next[key];
                          return next;
                        });
                      }}
                      disabled={isPending}
                      partial
                      idPrefix="default-spec"
                    />
                  ) : (
                    <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                      Select a vehicle type to fill in its specs.
                    </p>
                  )}
                </section>
              );
            }}
          </form.Subscribe>

          <div className="flex justify-end gap-3 border-t pt-5">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => {
                form.reset();
                setImageFile(null);
                setSpecValues(
                  specsToFormValues(initialType?.attributes ?? [], vehicleModel?.defaultSpecs),
                );
                setSpecErrors({});
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
                      {isEdit ? "Save model" : "Create Model"}
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

export default VehicleModelForm;
