"use client";

import { Lock, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ATTRIBUTE_TYPES, TAttributeType } from "@/types";
import { TAttributeDraft, labelToKey, labelToOptionValue } from "./attributeDraft";

export const ATTRIBUTE_TYPE_LABEL: Record<TAttributeType, string> = {
  TEXT: "Text",
  NUMBER: "Number",
  SELECT: "Single choice",
  MULTI_SELECT: "Multiple choice",
  BOOLEAN: "Yes / No",
};

type AttributeEditorProps = {
  draft: TAttributeDraft;
  errors: Record<string, string>;
  groups: string[];
  onChange: (draft: TAttributeDraft) => void;
};

const FieldError = ({ message }: { message?: string }) =>
  message ? (
    <p role="alert" className="text-xs text-destructive">
      {message}
    </p>
  ) : null;

/*
 * Editor for one attribute of the schema builder.
 */
const AttributeEditor = ({ draft, errors, groups, onChange }: AttributeEditorProps) => {
  const id = (field: string) => `${draft.uid}-${field}`;
  const update = (patch: Partial<TAttributeDraft>) => onChange({ ...draft, ...patch });

  const hasOptions = draft.type === "SELECT" || draft.type === "MULTI_SELECT";
  const isNumber = draft.type === "NUMBER";

  const handleLabelChange = (label: string) => {
    // new attributes: keep the key in sync with the label until it is edited by hand
    const keyFollowsLabel =
      !draft.isPersisted && (draft.key === "" || draft.key === labelToKey(draft.label));

    update({ label, ...(keyFollowsLabel && { key: labelToKey(label) }) });
  };

  const updateOption = (index: number, patch: { value?: string; label?: string }) => {
    const options = draft.options.map((option, optionIndex) => {
      if (optionIndex !== index) return option;

      const valueFollowsLabel =
        patch.label !== undefined &&
        (option.value === "" || option.value === labelToOptionValue(option.label));

      return {
        ...option,
        ...patch,
        ...(valueFollowsLabel && { value: labelToOptionValue(patch.label ?? "") }),
      };
    });

    update({ options });
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={id("label")}>
            Label <span className="text-destructive">*</span>
          </Label>
          <Input
            id={id("label")}
            placeholder="e.g. Engine capacity"
            value={draft.label}
            onChange={(event) => handleLabelChange(event.target.value)}
            aria-invalid={Boolean(errors.label)}
          />
          <FieldError message={errors.label} />
        </div>

        <div className="space-y-2">
          <Label htmlFor={id("key")}>
            Key <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input
              id={id("key")}
              placeholder="engineCapacity"
              value={draft.key}
              onChange={(event) => update({ key: event.target.value })}
              readOnly={draft.isPersisted}
              className={draft.isPersisted ? "pr-9 font-mono text-muted-foreground" : "font-mono"}
              aria-invalid={Boolean(errors.key)}
              aria-describedby={id("key-help")}
            />
            {draft.isPersisted && (
              <Lock
                className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
            )}
          </div>
          <p id={id("key-help")} className="text-xs text-muted-foreground">
            {draft.isPersisted
              ? "Locked: saved specs use this key. Remove and re-add to rename."
              : "Stored field name (camelCase). Cannot be changed after saving."}
          </p>
          <FieldError message={errors.key} />
        </div>

        <div className="space-y-2">
          <Label>Type</Label>
          <Select
            value={draft.type}
            onValueChange={(value) => value && update({ type: value as TAttributeType })}
          >
            <SelectTrigger className="w-full" aria-label="Attribute type">
              <SelectValue>{ATTRIBUTE_TYPE_LABEL[draft.type]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {ATTRIBUTE_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {ATTRIBUTE_TYPE_LABEL[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor={id("group")}>Group</Label>
          <Input
            id={id("group")}
            list={id("groups")}
            placeholder="e.g. Engine & Performance"
            value={draft.group}
            onChange={(event) => update({ group: event.target.value })}
            aria-invalid={Boolean(errors.group)}
          />
          <datalist id={id("groups")}>
            {groups.map((group) => (
              <option key={group} value={group} />
            ))}
          </datalist>
          <FieldError message={errors.group} />
        </div>
      </div>

      {isNumber && (
        <div className="grid gap-4 sm:grid-cols-4">
          {(
            [
              ["unit", "Unit", "cc"],
              ["min", "Min", "0"],
              ["max", "Max", "2500"],
              ["step", "Step", "1"],
            ] as const
          ).map(([field, label, placeholder]) => (
            <div key={field} className="space-y-2">
              <Label htmlFor={id(field)}>{label}</Label>
              <Input
                id={id(field)}
                inputMode={field === "unit" ? "text" : "decimal"}
                placeholder={placeholder}
                value={draft[field]}
                onChange={(event) => update({ [field]: event.target.value })}
                aria-invalid={Boolean(errors[field])}
              />
              <FieldError message={errors[field]} />
            </div>
          ))}
        </div>
      )}

      {hasOptions && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Options</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => update({ options: [...draft.options, { value: "", label: "" }] })}
            >
              <Plus /> Add option
            </Button>
          </div>

          {draft.options.length === 0 && (
            <p className="text-sm text-muted-foreground">No options yet.</p>
          )}

          <ul className="space-y-2">
            {draft.options.map((option, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: options are edited in place
              <li key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                <Input
                  placeholder="Label (e.g. Dual-channel)"
                  value={option.label}
                  onChange={(event) => updateOption(index, { label: event.target.value })}
                  aria-label={`Option ${index + 1} label`}
                />
                <Input
                  placeholder="value"
                  className="font-mono"
                  value={option.value}
                  onChange={(event) => updateOption(index, { value: event.target.value })}
                  aria-label={`Option ${index + 1} value`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    update({ options: draft.options.filter((_, optionIndex) => optionIndex !== index) })
                  }
                  aria-label={`Remove option ${option.label || index + 1}`}
                >
                  <Trash2 />
                </Button>
              </li>
            ))}
          </ul>
          <FieldError message={errors.options} />
        </div>
      )}

      {(draft.type === "TEXT" || isNumber) && (
        <div className="space-y-2">
          <Label htmlFor={id("placeholder")}>Placeholder</Label>
          <Input
            id={id("placeholder")}
            value={draft.placeholder}
            onChange={(event) => update({ placeholder: event.target.value })}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor={id("helpText")}>Help text</Label>
        <Input
          id={id("helpText")}
          placeholder="Shown under the field in listing forms"
          value={draft.helpText}
          onChange={(event) => update({ helpText: event.target.value })}
        />
      </div>

      <fieldset className="flex flex-wrap gap-x-6 gap-y-3">
        <legend className="sr-only">Behaviour</legend>
        {(
          [
            ["required", "Required in listings"],
            ["filterable", "Show as search filter"],
            ["showInCard", "Show on listing cards"],
          ] as const
        ).map(([field, label]) => {
          const disabled = field === "filterable" && draft.type === "TEXT";

          return (
            <label
              key={field}
              className="inline-flex cursor-pointer items-center gap-2 text-sm has-disabled:cursor-not-allowed has-disabled:opacity-50"
            >
              <input
                type="checkbox"
                className="size-4 accent-primary"
                checked={disabled ? false : draft[field]}
                disabled={disabled}
                onChange={(event) => update({ [field]: event.target.checked })}
              />
              {label}
            </label>
          );
        })}
      </fieldset>
    </div>
  );
};

export default AttributeEditor;
