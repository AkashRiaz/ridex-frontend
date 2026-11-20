"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { ArrowRight, Loader2 } from "lucide-react";
import Swal from "sweetalert2";
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
import {
  ListingVehicleStepInput,
  ListingVehicleStepZodSchema,
} from "@/components/validations/listing.validation";
import { IVehicleModel } from "@/types";
import { createListingDraftAction, updateListingAction } from "../../../_actions/listingActions";
import {
  getAllVehicleModelsAction,
  getVehicleModelByIdAction,
} from "../../../_actions/vehicleModelActions";
import { TWizardContext } from "./wizardTypes";

const NO_MODEL = "__other__";

const VehicleStep = ({ context }: { context: TWizardContext }) => {
  const { listing, vehicleTypes, brands, dashboardPath, onSaved, goToStep } = context;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const initialBrandId = listing?.brandId ?? "";
  const initialVehicleTypeId = listing?.vehicleTypeId ?? "";
  const [models, setModels] = useState<IVehicleModel[]>([]);
  // editing: the saved brand's models load on mount
  const [isLoadingModels, setIsLoadingModels] = useState(Boolean(initialBrandId));

  const defaultValues: ListingVehicleStepInput = {
    vehicleTypeId: listing?.vehicleTypeId ?? (vehicleTypes.length === 1 ? vehicleTypes[0].id : ""),
    brandId: listing?.brandId ?? "",
    vehicleModelId: listing?.vehicleModelId ?? "",
    year: listing ? String(listing.year) : "",
  };

  const form = useForm({
    defaultValues,
    validators: { onSubmit: ListingVehicleStepZodSchema },
    onSubmit: async ({ value }) => {
      const vehicleModelId = value.vehicleModelId || undefined;

      startTransition(async () => {
        // ── first save: create the draft (specs auto-fill from the model) ──
        if (!listing) {
          const result = await createListingDraftAction({
            vehicleTypeId: value.vehicleTypeId,
            brandId: value.brandId,
            vehicleModelId,
            year: Number(value.year),
          });

          if (!result.success || !result.data) {
            toast.error(result.message);
            return;
          }

          toast.success("Draft saved");
          // the edit URL makes the draft resumable
          router.replace(`${dashboardPath}/my-listings/${result.data.id}/edit?step=2`);
          return;
        }

        // ── later edits ──
        const modelChanged = (vehicleModelId ?? null) !== listing.vehicleModelId;
        const typeChanged = value.vehicleTypeId !== listing.vehicleTypeId;
        let specs: Record<string, unknown> | undefined;

        if (modelChanged && vehicleModelId && !typeChanged) {
          const confirmation = await Swal.fire({
            title: "Use this model's specs?",
            text: "Replace your current specs with the default specs of the new model?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes, replace",
            cancelButtonText: "Keep mine",
            reverseButtons: true,
          });

          if (confirmation.isConfirmed) {
            const modelResult = await getVehicleModelByIdAction(vehicleModelId);
            specs = modelResult.data?.defaultSpecs;
          }
        }

        const result = await updateListingAction(listing.id, {
          vehicleTypeId: value.vehicleTypeId,
          brandId: value.brandId,
          vehicleModelId: vehicleModelId ?? null,
          year: Number(value.year),
          ...(specs && { specs }),
        });

        if (!result.success || !result.data) {
          toast.error(result.message);
          return;
        }

        onSaved(result.data);
        toast.success(result.message);
        goToStep(2);
      });
    },
  });

  // models for the selected brand + type
  const loadModels = (brandId: string, vehicleTypeId: string) => {
    if (!brandId || !vehicleTypeId) {
      setModels([]);
      return;
    }

    setIsLoadingModels(true);

    getAllVehicleModelsAction({ query: { brand: brandId, vehicleType: vehicleTypeId, limit: "100" } })
      .then((result) => setModels(result.data ?? []))
      .finally(() => setIsLoadingModels(false));
  };

  // initial model list when editing (state is only set from the async result)
  useEffect(() => {
    if (!initialBrandId || !initialVehicleTypeId) return;

    let isCancelled = false;

    getAllVehicleModelsAction({
      query: { brand: initialBrandId, vehicleType: initialVehicleTypeId, limit: "100" },
    })
      .then((result) => {
        if (!isCancelled) setModels(result.data ?? []);
      })
      .finally(() => {
        if (!isCancelled) setIsLoadingModels(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [initialBrandId, initialVehicleTypeId]);

  const currentYear = new Date().getFullYear();

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
      <div>
        <h2 className="text-lg font-semibold">What are you selling?</h2>
        <p className="text-sm text-muted-foreground">
          Picking the exact model fills in its specs for you.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
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
                  onValueChange={(value) => {
                    if (!value) return;
                    field.handleChange(value);
                    form.setFieldValue("brandId", "");
                    form.setFieldValue("vehicleModelId", "");
                    setModels([]);
                  }}
                >
                  <SelectTrigger className="w-full" aria-label="Vehicle type" aria-invalid={isInvalid}>
                    <SelectValue>{selected?.name ?? "Select vehicle type"}</SelectValue>
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

        <form.Subscribe selector={(state) => state.values.vehicleTypeId}>
          {(vehicleTypeId) => (
            <form.Field name="brandId">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                const available = brands.filter((brand) =>
                  brand.vehicleTypes.some((type) => type.id === vehicleTypeId),
                );
                const selected = brands.find((brand) => brand.id === field.state.value);

                return (
                  <div className="space-y-2">
                    <Label>
                      Brand <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={field.state.value}
                      disabled={!vehicleTypeId}
                      onValueChange={(value) => {
                        if (!value) return;
                        field.handleChange(value);
                        form.setFieldValue("vehicleModelId", "");
                        loadModels(value, vehicleTypeId);
                      }}
                    >
                      <SelectTrigger className="w-full" aria-label="Brand" aria-invalid={isInvalid}>
                        <SelectValue>
                          {selected?.name ?? (vehicleTypeId ? "Select brand" : "Select a vehicle type first")}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {available.map((brand) => (
                          <SelectItem key={brand.id} value={brand.id}>
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldErrorText show={isInvalid} errors={field.state.meta.errors} />
                  </div>
                );
              }}
            </form.Field>
          )}
        </form.Subscribe>

        <form.Subscribe selector={(state) => state.values.brandId}>
          {(brandId) => (
            <form.Field name="vehicleModelId">
              {(field) => {
                const selected = models.find((model) => model.id === field.state.value);

                return (
                  <div className="space-y-2">
                    <Label>Model</Label>
                    <Select
                      value={field.state.value || NO_MODEL}
                      disabled={!brandId || isLoadingModels}
                      onValueChange={(value) => field.handleChange(!value || value === NO_MODEL ? "" : value)}
                    >
                      <SelectTrigger className="w-full" aria-label="Model">
                        <SelectValue>
                          {isLoadingModels
                            ? "Loading models…"
                            : (selected?.name ?? (brandId ? "My model is not listed" : "Select a brand first"))}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NO_MODEL}>My model is not listed</SelectItem>
                        {models.map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            {model.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Not listed? Continue without it and fill the specs yourself.
                    </p>
                  </div>
                );
              }}
            </form.Field>
          )}
        </form.Subscribe>

        <form.Field name="year">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <div className="space-y-2">
                <Label htmlFor={field.name}>
                  Model year <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={field.name}
                  inputMode="numeric"
                  maxLength={4}
                  placeholder={String(currentYear)}
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

      <div className="flex justify-end border-t pt-5">
        <Button type="submit" disabled={isPending} className="min-w-40">
          {isPending ? <Loader2 className="animate-spin" /> : <ArrowRight />}
          {listing ? "Save & continue" : "Create draft & continue"}
        </Button>
      </div>
    </form>
  );
};

export default VehicleStep;
