"use client";

import { useId, useTransition } from "react";
import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { FieldErrorText } from "@/components/ui/FieldErrorText";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  SavedSearchSettingsInput,
  buildSavedSearchSettingsZodSchema,
} from "@/components/validations/saved-search.validation";
import { SAVED_SEARCH_FREQUENCY_DESCRIPTION, SAVED_SEARCH_FREQUENCY_LABEL, SAVED_SEARCH_NAME_MAX } from "@/lib/enum";
import { cn } from "@/lib/utils";
import { TSavedSearchAlertFrequency } from "@/types";

const FREQUENCIES: TSavedSearchAlertFrequency[] = ["INSTANT", "DAILY", "OFF"];

type SavedSearchFormProps = {
  defaultValues: SavedSearchSettingsInput;
  submitLabel: string;
  // false when saving: an empty name is generated from the filters
  nameRequired: boolean;
  onCancel: () => void;
  // return true when saved (the dialog closes)
  onSubmit: (value: SavedSearchSettingsInput) => Promise<boolean>;
};

/*
 * Name + alert settings. Shared by SavedSearchCreate (search page)
 * and SavedSearchUpdate (dashboard), CONVENTIONS Part G.
 */
export default function SavedSearchForm({
  defaultValues,
  submitLabel,
  nameRequired,
  onCancel,
  onSubmit,
}: SavedSearchFormProps) {
  const formId = useId();
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    defaultValues,
    validators: { onSubmit: buildSavedSearchSettingsZodSchema({ nameRequired }) },
    onSubmit: async ({ value }) => {
      startTransition(async () => {
        await onSubmit({ ...value, name: value.name.trim() });
      });
    },
  });

  return (
    <>
      <form
        id={formId}
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          form.handleSubmit();
        }}
        noValidate
        className="space-y-5"
      >
        <form.Field name="name">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <div className="space-y-2">
                <Label htmlFor={`${formId}-name`}>Name{!nameRequired && " (optional)"}</Label>
                <Input
                  id={`${formId}-name`}
                  value={field.state.value}
                  placeholder={nameRequired ? undefined : "e.g. Yamaha under 5 lakh — or leave empty"}
                  maxLength={SAVED_SEARCH_NAME_MAX}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                  aria-invalid={isInvalid}
                />
                <FieldErrorText show={isInvalid} errors={field.state.meta.errors} />
              </div>
            );
          }}
        </form.Field>

        <form.Field name="alertFrequency">
          {(field) => (
            <fieldset className="space-y-2">
              <legend className="mb-2 text-sm font-medium">Alerts</legend>
              {FREQUENCIES.map((frequency) => (
                <label
                  key={frequency}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition hover:bg-muted/50",
                    field.state.value === frequency && "border-primary bg-primary/5",
                  )}
                >
                  <input
                    type="radio"
                    name={`${formId}-frequency`}
                    value={frequency}
                    checked={field.state.value === frequency}
                    onChange={() => field.handleChange(frequency)}
                    className="mt-0.5 size-4 accent-primary"
                  />
                  <span className="space-y-0.5">
                    <span className="block text-sm font-medium">{SAVED_SEARCH_FREQUENCY_LABEL[frequency]}</span>
                    <span className="block text-xs text-muted-foreground">
                      {SAVED_SEARCH_FREQUENCY_DESCRIPTION[frequency]}
                    </span>
                  </span>
                </label>
              ))}
            </fieldset>
          )}
        </form.Field>

        <form.Subscribe selector={(state) => state.values.alertFrequency}>
          {(frequency) => (
            <form.Field name="notifyPriceDrops">
              {(field) => (
                <label
                  className={cn(
                    "flex cursor-pointer items-start gap-3 text-sm",
                    frequency === "OFF" && "cursor-not-allowed opacity-50",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={field.state.value}
                    disabled={frequency === "OFF"}
                    onChange={(event) => field.handleChange(event.target.checked)}
                    className="mt-0.5 size-4 accent-primary"
                  />
                  <span>
                    <span className="block font-medium">Price drops too</span>
                    <span className="block text-xs text-muted-foreground">
                      Tell me when a matching listing gets cheaper.
                    </span>
                  </span>
                </label>
              )}
            </form.Field>
          )}
        </form.Subscribe>
      </form>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" form={formId} disabled={isPending}>
          {isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {submitLabel}
        </Button>
      </DialogFooter>
    </>
  );
}
