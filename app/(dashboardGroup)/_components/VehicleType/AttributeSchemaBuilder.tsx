"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Eye,
  ListPlus,
  Loader2,
  Pencil,
  Save,
  Trash2,
  Undo2,
} from "lucide-react";
import Swal from "sweetalert2";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DynamicSpecFields,
  TSpecFormValues,
} from "@/components/dynamicForm/DynamicSpecFields";
import { validateSpecValues } from "@/components/dynamicForm/buildSpecSchema";
import { AttributeFormZodSchema } from "@/components/validations/vehicle-type.validation";
import { cn } from "@/lib/utils";
import { IVehicleAttribute } from "@/types";
import { updateVehicleTypeAttributesAction } from "../../_actions/vehicleTypeActions";
import AttributeEditor, { ATTRIBUTE_TYPE_LABEL } from "./AttributeEditor";
import { TAttributeDraft, fromDraft, newDraft, toDraft } from "./attributeDraft";

type AttributeSchemaBuilderProps = {
  vehicleTypeId: string;
  vehicleTypeName: string;
  attributes: IVehicleAttribute[];
  modelCount: number;
};

const AttributeSchemaBuilder = ({
  vehicleTypeId,
  vehicleTypeName,
  attributes,
  modelCount,
}: AttributeSchemaBuilderProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const initialDrafts = useMemo(
    () =>
      attributes
        .slice()
        .sort((first, second) => first.sortOrder - second.sortOrder)
        .map(toDraft),
    [attributes],
  );

  const [drafts, setDrafts] = useState<TAttributeDraft[]>(initialDrafts);
  const [expandedUid, setExpandedUid] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, Record<string, string>>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [previewValues, setPreviewValues] = useState<TSpecFormValues>({});
  const [previewErrors, setPreviewErrors] = useState<Record<string, string>>({});

  const serialize = (list: TAttributeDraft[]) =>
    JSON.stringify(list.map((draft, index) => fromDraft(draft, index)));

  const isDirty = serialize(drafts) !== serialize(initialDrafts);

  const groups = Array.from(new Set(drafts.map((draft) => draft.group).filter(Boolean)));

  const previewAttributes = drafts
    .filter((draft) => draft.key && draft.label)
    .map((draft, index) => fromDraft(draft, index));

  const updateDraft = (updated: TAttributeDraft) =>
    setDrafts((current) => current.map((draft) => (draft.uid === updated.uid ? updated : draft)));

  const moveDraft = (index: number, direction: -1 | 1) =>
    setDrafts((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const removeDraft = async (draft: TAttributeDraft) => {
    if (draft.isPersisted) {
      const confirmation = await Swal.fire({
        title: `Remove "${draft.label}"?`,
        text: "Saving will be rejected if any model still has a value for this attribute.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Remove",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#dc2626",
        reverseButtons: true,
      });

      if (!confirmation.isConfirmed) return;
    }

    setDrafts((current) => current.filter((item) => item.uid !== draft.uid));
  };

  const addDraft = () => {
    const draft = newDraft(drafts[drafts.length - 1]?.group || "General");
    setDrafts((current) => [...current, draft]);
    setExpandedUid(draft.uid);
  };

  const validateAll = () => {
    const nextErrors: Record<string, Record<string, string>> = {};

    for (const draft of drafts) {
      const result = AttributeFormZodSchema.safeParse(draft);

      if (!result.success) {
        nextErrors[draft.uid] = {};
        for (const issue of result.error.issues) {
          const field = String(issue.path[0] ?? "label");
          nextErrors[draft.uid][field] ??= issue.message;
        }
      }
    }

    // keys must be unique across the schema
    const seen = new Map<string, string>();
    for (const draft of drafts) {
      const key = draft.key.trim();
      if (!key) continue;
      if (seen.has(key)) {
        nextErrors[draft.uid] = { ...nextErrors[draft.uid], key: `Key "${key}" is already used` };
      }
      seen.set(key, draft.uid);
    }

    setErrors(nextErrors);

    const firstInvalid = drafts.find((draft) => nextErrors[draft.uid]);
    if (firstInvalid) setExpandedUid(firstInvalid.uid);

    return !firstInvalid;
  };

  const handleSave = () => {
    if (!validateAll()) {
      toast.error("Fix the highlighted attributes before saving");
      return;
    }

    startTransition(async () => {
      const result = await updateVehicleTypeAttributesAction(
        vehicleTypeId,
        drafts.map((draft, index) => fromDraft(draft, index)),
      );

      if (result.success) {
        toast.success(result.message);
        setExpandedUid(null);
        router.refresh();
      } else {
        // 409 lists the models that would break
        await Swal.fire({
          title: "Could not save the schema",
          text: result.message,
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    });
  };

  const runPreviewValidation = () => {
    const result = validateSpecValues(previewAttributes, previewValues);
    setPreviewErrors(result.success ? {} : result.errors);
    if (result.success) toast.success("These values pass validation");
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Spec attributes</h2>
          <p className="text-sm text-muted-foreground">
            {drafts.length} attribute{drafts.length === 1 ? "" : "s"} for {vehicleTypeName}.
            Listing forms, filters and spec tables are generated from this schema.
            {modelCount > 0 && ` ${modelCount} model(s) are validated against it when you save.`}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => setShowPreview((value) => !value)}>
            <Eye /> {showPreview ? "Hide preview" : "Preview form"}
          </Button>
          <Button type="button" variant="outline" onClick={addDraft} disabled={isPending}>
            <ListPlus /> Add attribute
          </Button>
        </div>
      </div>

      <div className={cn("grid gap-5", showPreview && "xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]")}>
        {/* Attribute list */}
        <ol className="space-y-3">
          {drafts.length === 0 && (
            <li className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
              No attributes yet. Add the first spec field (for example Engine capacity).
            </li>
          )}

          {drafts.map((draft, index) => {
            const isExpanded = expandedUid === draft.uid;
            const draftErrors = errors[draft.uid] ?? {};
            const hasErrors = Object.keys(draftErrors).length > 0;

            return (
              <li
                key={draft.uid}
                className={cn(
                  "rounded-xl border bg-card transition",
                  hasErrors && "border-destructive/50",
                  isExpanded && "shadow-card",
                )}
              >
                <div className="flex items-center gap-3 p-3">
                  <button
                    type="button"
                    onClick={() => setExpandedUid(isExpanded ? null : draft.uid)}
                    className="flex min-w-0 flex-1 items-center gap-3 rounded-md text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
                    aria-expanded={isExpanded}
                  >
                    <ChevronDown
                      className={cn("size-4 shrink-0 transition-transform", !isExpanded && "-rotate-90")}
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {draft.label || <span className="text-muted-foreground">Untitled attribute</span>}
                        {draft.type === "NUMBER" && draft.unit && (
                          <span className="text-muted-foreground"> ({draft.unit})</span>
                        )}
                      </p>
                      <p className="truncate font-mono text-xs text-muted-foreground">
                        {draft.key || "no-key"} · {draft.group || "General"}
                      </p>
                    </div>
                  </button>

                  <div className="hidden shrink-0 flex-wrap justify-end gap-1 md:flex">
                    <Badge variant="outline">{ATTRIBUTE_TYPE_LABEL[draft.type]}</Badge>
                    {draft.required && <Badge variant="secondary">Required</Badge>}
                    {draft.filterable && draft.type !== "TEXT" && <Badge variant="secondary">Filter</Badge>}
                    {draft.showInCard && <Badge variant="secondary">Card</Badge>}
                    {!draft.isPersisted && <Badge>New</Badge>}
                  </div>

                  <div className="flex shrink-0 gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => moveDraft(index, -1)}
                      disabled={index === 0}
                      aria-label={`Move ${draft.label || "attribute"} up`}
                    >
                      <ArrowUp />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => moveDraft(index, 1)}
                      disabled={index === drafts.length - 1}
                      aria-label={`Move ${draft.label || "attribute"} down`}
                    >
                      <ArrowDown />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setExpandedUid(isExpanded ? null : draft.uid)}
                      aria-label={`Edit ${draft.label || "attribute"}`}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeDraft(draft)}
                      aria-label={`Remove ${draft.label || "attribute"}`}
                    >
                      <Trash2 className="text-destructive" />
                    </Button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t p-4">
                    <AttributeEditor
                      draft={draft}
                      errors={draftErrors}
                      groups={groups}
                      onChange={updateDraft}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ol>

        {/* Live preview */}
        {showPreview && (
          <aside className="h-fit space-y-4 rounded-xl border bg-muted/20 p-5 xl:sticky xl:top-4">
            <div>
              <h3 className="font-semibold">Listing form preview</h3>
              <p className="text-sm text-muted-foreground">
                What sellers will see. Unsaved changes are included.
              </p>
            </div>
            <DynamicSpecFields
              attributes={previewAttributes}
              values={previewValues}
              errors={previewErrors}
              onChange={(key, value) => setPreviewValues((current) => ({ ...current, [key]: value }))}
              idPrefix="preview"
            />
            <Button type="button" variant="outline" size="sm" onClick={runPreviewValidation}>
              Test validation
            </Button>
          </aside>
        )}
      </div>

      {/* Save bar */}
      <div className="sticky bottom-0 z-10 -mx-2 flex flex-col gap-3 border-t bg-background/95 px-2 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {isDirty ? "You have unsaved changes." : "All changes saved."}
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={!isDirty || isPending}
            onClick={() => {
              setDrafts(initialDrafts);
              setErrors({});
              setExpandedUid(null);
            }}
          >
            <Undo2 /> Discard
          </Button>
          <Button type="button" onClick={handleSave} disabled={!isDirty || isPending} className="min-w-36">
            {isPending ? <Loader2 className="animate-spin" /> : <Save />}
            {isPending ? "Saving..." : "Save schema"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AttributeSchemaBuilder;
