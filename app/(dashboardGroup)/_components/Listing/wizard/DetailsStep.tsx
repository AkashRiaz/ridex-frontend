"use client";

import { useState, useTransition } from "react";
import { useForm } from "@tanstack/react-form";
import { ArrowLeft, ArrowRight, Loader2, LocateFixed, X } from "lucide-react";
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
  ListingDetailsStepInput,
  ListingDetailsStepZodSchema,
} from "@/components/validations/listing.validation";
import { BD_DIVISIONS, isInsideBangladesh } from "@/lib/bdLocations";
import { LISTING_CONDITION_LABEL, LISTING_LIMITS } from "@/lib/enum";
import { formatCurrency } from "@/lib/formatCurrency";
import { TListingCondition } from "@/types";
import { updateListingAction } from "../../../_actions/listingActions";
import { TWizardContext } from "./wizardTypes";

type TExactLocation = { latitude: number; longitude: number } | null;

const DetailsStep = ({ context }: { context: TWizardContext }) => {
  const { listing, onSaved, goToStep } = context;
  const [isPending, startTransition] = useTransition();
  const [isLocating, setIsLocating] = useState(false);
  // only sent when the seller explicitly shares it; otherwise the district centre is used
  const [exactLocation, setExactLocation] = useState<TExactLocation>(null);

  const defaultValues: ListingDetailsStepInput = {
    title: listing?.title ?? "",
    price: listing && listing.price > 0 ? String(listing.price) : "",
    isNegotiable: listing?.isNegotiable ?? false,
    condition: listing?.condition ?? "USED",
    mileage: listing ? String(listing.mileage) : "0",
    color: listing?.color ?? "",
    description: listing?.description ?? "",
    division: listing?.division ?? "",
    district: listing?.district ?? "",
    area: listing?.area ?? "",
  };

  const form = useForm({
    defaultValues,
    validators: { onSubmit: ListingDetailsStepZodSchema },
    onSubmit: async ({ value }) => {
      if (!listing) return;

      startTransition(async () => {
        const result = await updateListingAction(listing.id, {
          title: value.title.trim(),
          price: Number(value.price),
          isNegotiable: value.isNegotiable,
          condition: value.condition,
          mileage: Number(value.mileage),
          color: value.color.trim() || null,
          description: value.description.trim(),
          division: value.division,
          district: value.district,
          area: value.area.trim() || null,
          ...(exactLocation && exactLocation),
        });

        if (!result.success || !result.data) {
          toast.error(result.message);
          return;
        }

        onSaved(result.data);
        toast.success(result.data.sentBackToReview ? "Saved — sent for review again" : "Details saved");
        goToStep(4);
      });
    },
  });

  const shareLocation = () => {
    if (!("geolocation" in navigator)) {
      toast.error("Your browser cannot share its location");
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude, longitude } = position.coords;

        if (!isInsideBangladesh(latitude, longitude)) {
          toast.error("Your location appears to be outside Bangladesh");
          return;
        }

        setExactLocation({
          latitude: Number(latitude.toFixed(6)),
          longitude: Number(longitude.toFixed(6)),
        });
        toast.success("Exact location added — buyers nearby will find you first");
      },
      () => {
        setIsLocating(false);
        toast.error("Location permission was denied");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

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
        <h2 className="text-lg font-semibold">Price & details</h2>
        <p className="text-sm text-muted-foreground">A clear title and an honest description sell faster.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <form.Field name="title">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor={field.name}>
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={field.name}
                  maxLength={LISTING_LIMITS.titleMax}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  aria-invalid={isInvalid}
                />
                <div className="flex justify-between">
                  <FieldErrorText show={isInvalid} errors={field.state.meta.errors} />
                  <span className="ml-auto text-xs text-muted-foreground">
                    {field.state.value.length}/{LISTING_LIMITS.titleMax}
                  </span>
                </div>
              </div>
            );
          }}
        </form.Field>

        <form.Field name="price">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            const preview = /^\d+$/.test(field.state.value) ? formatCurrency(Number(field.state.value)) : null;

            return (
              <div className="space-y-2">
                <Label htmlFor={field.name}>
                  Price (৳) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={field.name}
                  inputMode="numeric"
                  placeholder="e.g. 250000"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value.replace(/[^\d]/g, ""))}
                  onBlur={field.handleBlur}
                  aria-invalid={isInvalid}
                  aria-describedby={`${field.name}-preview`}
                />
                <p id={`${field.name}-preview`} className="text-xs text-muted-foreground">
                  {preview ?? "Numbers only"}
                </p>
                <FieldErrorText show={isInvalid} errors={field.state.meta.errors} />
              </div>
            );
          }}
        </form.Field>

        <form.Field name="mileage">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <div className="space-y-2">
                <Label htmlFor={field.name}>
                  Kilometres driven <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={field.name}
                  inputMode="numeric"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value.replace(/[^\d]/g, ""))}
                  onBlur={field.handleBlur}
                  aria-invalid={isInvalid}
                />
                <FieldErrorText show={isInvalid} errors={field.state.meta.errors} />
              </div>
            );
          }}
        </form.Field>

        <form.Field name="condition">
          {(field) => (
            <div className="space-y-2">
              <Label>
                Condition <span className="text-destructive">*</span>
              </Label>
              <Select
                value={field.state.value}
                onValueChange={(value) => value && field.handleChange(value as TListingCondition)}
              >
                <SelectTrigger className="w-full" aria-label="Condition">
                  <SelectValue>{LISTING_CONDITION_LABEL[field.state.value]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(LISTING_CONDITION_LABEL) as TListingCondition[]).map((condition) => (
                    <SelectItem key={condition} value={condition}>
                      {LISTING_CONDITION_LABEL[condition]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </form.Field>

        <form.Field name="color">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Color</Label>
                <Input
                  id={field.name}
                  placeholder="e.g. Racing Blue"
                  maxLength={30}
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

        <form.Field name="isNegotiable">
          {(field) => (
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm md:col-span-2">
              <input
                type="checkbox"
                className="size-4 accent-primary"
                checked={field.state.value}
                onChange={(e) => field.handleChange(e.target.checked)}
              />
              The price is negotiable
            </label>
          )}
        </form.Field>

        <form.Field name="description">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor={field.name}>Description</Label>
                <Textarea
                  id={field.name}
                  rows={6}
                  maxLength={LISTING_LIMITS.descriptionMax}
                  placeholder="Service history, modifications, reason for selling, papers…"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  aria-invalid={isInvalid}
                />
                <div className="flex justify-between">
                  <FieldErrorText show={isInvalid} errors={field.state.meta.errors} />
                  <span className="ml-auto text-xs text-muted-foreground">
                    {field.state.value.length}/{LISTING_LIMITS.descriptionMax}
                  </span>
                </div>
              </div>
            );
          }}
        </form.Field>
      </div>

      {/* Location */}
      <fieldset className="space-y-4 border-t pt-6">
        <legend className="text-base font-semibold">Location</legend>
        <div className="grid gap-4 md:grid-cols-3">
          <form.Field name="division">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <div className="space-y-2">
                  <Label>
                    Division <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => {
                      if (!value) return;
                      field.handleChange(value);
                      form.setFieldValue("district", "");
                      setExactLocation(null);
                    }}
                  >
                    <SelectTrigger className="w-full" aria-label="Division" aria-invalid={isInvalid}>
                      <SelectValue>{field.state.value || "Select division"}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {BD_DIVISIONS.map((division) => (
                        <SelectItem key={division.name} value={division.name}>
                          {division.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldErrorText show={isInvalid} errors={field.state.meta.errors} />
                </div>
              );
            }}
          </form.Field>

          <form.Subscribe selector={(state) => state.values.division}>
            {(division) => (
              <form.Field name="district">
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  const districts = BD_DIVISIONS.find((item) => item.name === division)?.districts ?? [];

                  return (
                    <div className="space-y-2">
                      <Label>
                        District <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={field.state.value}
                        disabled={!division}
                        onValueChange={(value) => {
                          if (!value) return;
                          field.handleChange(value);
                          setExactLocation(null);
                        }}
                      >
                        <SelectTrigger className="w-full" aria-label="District" aria-invalid={isInvalid}>
                          <SelectValue>
                            {field.state.value || (division ? "Select district" : "Select a division first")}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {districts.map((district) => (
                            <SelectItem key={district.name} value={district.name}>
                              {district.name}
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

          <form.Field name="area">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Area</Label>
                  <Input
                    id={field.name}
                    placeholder="e.g. Mirpur 10"
                    maxLength={100}
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

        <div className="flex flex-wrap items-center gap-3 text-sm">
          {exactLocation ? (
            <>
              <span className="text-success">Exact location will be saved.</span>
              <Button type="button" variant="ghost" size="sm" onClick={() => setExactLocation(null)}>
                <X /> Use district centre instead
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="outline" size="sm" onClick={shareLocation} disabled={isLocating}>
                {isLocating ? <Loader2 className="animate-spin" /> : <LocateFixed />}
                Use my exact location
              </Button>
              <span className="text-muted-foreground">
                Optional. Otherwise we use the district centre for &ldquo;near me&rdquo; search.
              </span>
            </>
          )}
        </div>
      </fieldset>

      <div className="flex justify-between gap-3 border-t pt-5">
        <Button type="button" variant="ghost" onClick={() => goToStep(2)} disabled={isPending}>
          <ArrowLeft /> Back
        </Button>
        <Button type="submit" disabled={isPending} className="min-w-36">
          {isPending ? <Loader2 className="animate-spin" /> : <ArrowRight />}
          Save & continue
        </Button>
      </div>
    </form>
  );
};

export default DetailsStep;
