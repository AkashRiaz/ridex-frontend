"use client";

import { useState, useTransition } from "react";
import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldErrorText } from "@/components/ui/FieldErrorText";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ReasonDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  label: string;
  placeholder?: string;
  confirmLabel: string;
  // zod schema for { text } (required reason, optional note, …)
  schema: z.ZodType<{ text: string }, { text: string }>;
  maxLength: number;
  destructive?: boolean;
  // return true to close the dialog
  onConfirm: (text: string) => Promise<boolean>;
};

/*
 * One text field + confirm, used for "decline with a reason", "cancel with a
 * reason" and "confirm with a note" on offers and test rides.
 */
export function ReasonDialog({
  open,
  onOpenChange,
  title,
  description,
  label,
  placeholder,
  confirmLabel,
  schema,
  maxLength,
  destructive = false,
  onConfirm,
}: ReasonDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [fieldId] = useState(() => `reason-${Math.random().toString(36).slice(2, 8)}`);

  const form = useForm({
    defaultValues: { text: "" },
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => {
      startTransition(async () => {
        const done = await onConfirm(value.text.trim());
        if (done) {
          form.reset();
          onOpenChange(false);
        }
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <form
          id={`${fieldId}-form`}
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            form.handleSubmit();
          }}
          noValidate
        >
          <form.Field name="text">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <div className="space-y-2">
                  <Label htmlFor={fieldId}>{label}</Label>
                  <Textarea
                    id={fieldId}
                    rows={3}
                    maxLength={maxLength}
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                    placeholder={placeholder}
                    aria-invalid={isInvalid}
                  />
                  <FieldErrorText show={isInvalid} errors={field.state.meta.errors} />
                </div>
              );
            }}
          </form.Field>
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Back
          </Button>
          <Button
            type="submit"
            form={`${fieldId}-form`}
            variant={destructive ? "destructive" : "default"}
            disabled={isPending}
          >
            {isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
