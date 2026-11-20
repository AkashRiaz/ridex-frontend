"use client";

import { useEffect, useMemo } from "react";
import { CheckCircle2, Circle, FileText, ImagePlus, X } from "lucide-react";
import { DOCUMENT_KIND_LABEL } from "@/lib/enum";
import { cn } from "@/lib/utils";
import { TDocumentKind, TVerificationType } from "@/types";

export type TDocumentRule = {
  kind: TDocumentKind;
  required: boolean;
  max: number;
  pdf: boolean;
  hint: string;
};

// mirrors backend VERIFICATION_RULES
export const VERIFICATION_DOCUMENTS: Record<TVerificationType, TDocumentRule[]> = {
  ID: [
    { kind: "NID_FRONT", required: true, max: 1, pdf: false, hint: "All four corners visible, no glare" },
    { kind: "NID_BACK", required: true, max: 1, pdf: false, hint: "The side with the address" },
    { kind: "SELFIE", required: true, max: 1, pdf: false, hint: "Your face and the NID front, both clear" },
  ],
  DEALER: [
    { kind: "TRADE_LICENSE", required: true, max: 1, pdf: true, hint: "Current, valid trade license (photo or PDF)" },
    { kind: "TIN_CERTIFICATE", required: false, max: 1, pdf: true, hint: "Optional — speeds up review" },
    { kind: "SHOWROOM_PHOTO", required: false, max: 4, pdf: false, hint: "Optional — up to 4 photos with your signboard" },
  ],
};

export type TDocumentFiles = Partial<Record<TDocumentKind, File[]>>;

const MAX_FILE_BYTES = 5 * 1024 * 1024;

export const getMissingDocuments = (type: TVerificationType, files: TDocumentFiles) =>
  VERIFICATION_DOCUMENTS[type].filter((rule) => rule.required && !files[rule.kind]?.length);

const FilePreview = ({ file, onRemove }: { file: File; onRemove: () => void }) => {
  const isImage = file.type.startsWith("image/");
  const url = useMemo(() => (isImage ? URL.createObjectURL(file) : null), [file, isImage]);

  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url);
    },
    [url],
  );

  return (
    <div className="relative size-24 overflow-hidden rounded-lg border bg-muted">
      {url ? (
        // local blob preview — next/image cannot optimise object URLs
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={file.name} className="size-full object-cover" />
      ) : (
        <div className="flex size-full flex-col items-center justify-center gap-1 p-2 text-center">
          <FileText className="size-6 text-muted-foreground" aria-hidden="true" />
          <span className="line-clamp-2 text-[0.65rem] text-muted-foreground">{file.name}</span>
        </div>
      )}
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-1 top-1 inline-flex size-6 items-center justify-center rounded-full bg-black/60 text-white"
        aria-label={`Remove ${file.name}`}
      >
        <X className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  );
};

/*
 * One slot per document kind, with previews and a checklist.
 */
export function DocumentPicker({
  type,
  files,
  onChange,
  disabled,
  showErrors,
}: {
  type: TVerificationType;
  files: TDocumentFiles;
  onChange: (files: TDocumentFiles) => void;
  disabled?: boolean;
  showErrors?: boolean;
}) {
  const rules = VERIFICATION_DOCUMENTS[type];

  const add = (rule: TDocumentRule, list: FileList | null) => {
    if (!list) return;

    const accepted = Array.from(list).filter((file) => {
      const isImage = file.type.startsWith("image/");
      const isPdf = file.type === "application/pdf";
      // large photos are compressed on submit; PDFs must already fit
      return (isImage || (rule.pdf && isPdf)) && (isImage || file.size <= MAX_FILE_BYTES);
    });

    const current = files[rule.kind] ?? [];
    const next = rule.max === 1 ? accepted.slice(0, 1) : [...current, ...accepted].slice(0, rule.max);

    onChange({ ...files, [rule.kind]: next });
  };

  const remove = (kind: TDocumentKind, index: number) =>
    onChange({ ...files, [kind]: (files[kind] ?? []).filter((_, position) => position !== index) });

  return (
    <div className="space-y-4">
      <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm" aria-label="Checklist">
        {rules.map((rule) => {
          const done = Boolean(files[rule.kind]?.length);

          return (
            <li key={rule.kind} className={cn("inline-flex items-center gap-1.5", done ? "text-success" : "text-muted-foreground")}>
              {done ? <CheckCircle2 className="size-4" aria-hidden="true" /> : <Circle className="size-4" aria-hidden="true" />}
              {DOCUMENT_KIND_LABEL[rule.kind]}
              {!rule.required && " (optional)"}
            </li>
          );
        })}
      </ul>

      {rules.map((rule) => {
        const current = files[rule.kind] ?? [];
        const isMissing = showErrors && rule.required && current.length === 0;
        const inputId = `document-${rule.kind}`;

        return (
          <div
            key={rule.kind}
            className={cn("space-y-3 rounded-xl border p-4", isMissing && "border-destructive/60 bg-destructive/5")}
          >
            <div>
              <p className="text-sm font-medium">
                {DOCUMENT_KIND_LABEL[rule.kind]} {rule.required && <span className="text-destructive">*</span>}
              </p>
              <p className="text-xs text-muted-foreground">{rule.hint}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              {current.map((file, index) => (
                <FilePreview key={`${file.name}-${file.size}-${file.lastModified}`} file={file} onRemove={() => remove(rule.kind, index)} />
              ))}
              {current.length < rule.max && (
                <label
                  htmlFor={inputId}
                  className={cn(
                    "flex size-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-xs text-muted-foreground transition hover:bg-muted",
                    disabled && "pointer-events-none opacity-50",
                  )}
                >
                  <ImagePlus className="size-5" aria-hidden="true" />
                  {current.length ? "Add more" : "Add file"}
                  <input
                    id={inputId}
                    type="file"
                    className="sr-only"
                    accept={rule.pdf ? "image/jpeg,image/png,image/webp,application/pdf" : "image/jpeg,image/png,image/webp"}
                    multiple={rule.max > 1}
                    disabled={disabled}
                    onChange={(event) => {
                      add(rule, event.target.files);
                      event.target.value = "";
                    }}
                  />
                </label>
              )}
            </div>

            {isMissing && (
              <p className="text-xs text-destructive" role="alert">
                {DOCUMENT_KIND_LABEL[rule.kind]} is required
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
