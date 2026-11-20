"use client";

import { useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DynamicSpecFields,
  TSpecFormValues,
} from "@/components/dynamicForm/DynamicSpecFields";
import {
  specsToFormValues,
  validateSpecValues,
} from "@/components/dynamicForm/buildSpecSchema";
import { updateListingAction } from "../../../_actions/listingActions";
import { TWizardContext } from "./wizardTypes";

/*
 * Specs rendered from the vehicle type's attribute schema, pre-filled from the model.
 * "Continue" needs required specs; "Save draft" accepts partial specs on drafts.
 */
const SpecsStep = ({ context }: { context: TWizardContext }) => {
  const { listing, vehicleTypes, onSaved, goToStep } = context;
  const [isPending, startTransition] = useTransition();

  const attributes =
    vehicleTypes.find((vehicleType) => vehicleType.id === listing?.vehicleTypeId)?.attributes ??
    listing?.vehicleType.attributes ??
    [];

  const [values, setValues] = useState<TSpecFormValues>(() =>
    specsToFormValues(attributes, listing?.specs),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!listing) return null;

  const isDraftLike = listing.status === "DRAFT" || listing.status === "REJECTED";

  const save = (andContinue: boolean) => {
    // drafts may be saved incomplete; continuing / live listings need required specs
    const result = validateSpecValues(attributes, values, {
      partial: !andContinue && isDraftLike,
    });

    if (!result.success) {
      setErrors(result.errors);
      toast.error(result.message);
      return;
    }

    setErrors({});

    startTransition(async () => {
      const saved = await updateListingAction(listing.id, { specs: result.data });

      if (!saved.success || !saved.data) {
        toast.error(saved.message);
        return;
      }

      onSaved(saved.data);
      toast.success(saved.data.sentBackToReview ? "Saved — sent for review again" : "Specs saved");
      if (andContinue) goToStep(3);
    });
  };

  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-lg font-semibold">Specifications</h2>
        <p className="text-sm text-muted-foreground">
          {listing.vehicleModelId
            ? "We filled these from the model. Check and correct anything that differs on your vehicle."
            : "Fill in what you know. Fields marked * are required."}
        </p>
      </div>

      <DynamicSpecFields
        attributes={attributes}
        values={values}
        errors={errors}
        onChange={(key, value) => {
          setValues((current) => ({ ...current, [key]: value }));
          setErrors((current) => {
            const next = { ...current };
            delete next[key];
            return next;
          });
        }}
        disabled={isPending}
        idPrefix="listing-spec"
      />

      <div className="flex flex-wrap justify-between gap-3 border-t pt-5">
        <Button type="button" variant="ghost" onClick={() => goToStep(1)} disabled={isPending}>
          <ArrowLeft /> Back
        </Button>
        <div className="flex gap-2">
          {isDraftLike && (
            <Button type="button" variant="outline" onClick={() => save(false)} disabled={isPending}>
              <Save /> Save draft
            </Button>
          )}
          <Button type="button" onClick={() => save(true)} disabled={isPending} className="min-w-36">
            {isPending ? <Loader2 className="animate-spin" /> : <ArrowRight />}
            Save & continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SpecsStep;
