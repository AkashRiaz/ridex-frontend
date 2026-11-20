"use client";

import { useEffect, useMemo, useRef } from "react";
import { ImageIcon, Upload, X } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { validateImageFile } from "@/lib/toMultipart";
import { cn } from "@/lib/utils";

type ImageUploadFieldProps = {
  label: string;
  currentImageUrl?: string | null;
  file: File | null;
  onFileChange: (file: File | null) => void;
  disabled?: boolean;
  // square logos vs wide photos
  aspect?: "square" | "wide";
};

export function ImageUploadField({
  label,
  currentImageUrl,
  file,
  onFileChange,
  disabled = false,
  aspect = "square",
}: ImageUploadFieldProps) {
  const inputReference = useRef<HTMLInputElement | null>(null);

  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    event.target.value = "";

    if (!selected) return;

    const error = validateImageFile(selected);

    if (error) {
      toast.error(error);
      return;
    }

    onFileChange(selected);
  };

  const frameClassName = cn(
    "relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted/40",
    aspect === "square" ? "size-20" : "h-20 w-32",
  );

  return (
    <div className="flex items-center gap-4">
      <div className={frameClassName}>
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt={`New ${label.toLowerCase()} preview`} className="size-full object-contain" />
        ) : currentImageUrl ? (
          <Image
            src={currentImageUrl}
            alt={label}
            fill
            sizes="128px"
            className="object-contain"
          />
        ) : (
          <ImageIcon className="size-6 text-muted-foreground" aria-hidden="true" />
        )}
      </div>

      <div className="space-y-1.5">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">JPG, PNG, WebP or AVIF, up to 5MB</p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputReference.current?.click()}
            disabled={disabled}
          >
            <Upload /> {currentImageUrl || file ? "Replace" : "Upload"}
          </Button>
          {file && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onFileChange(null)}
              disabled={disabled}
            >
              <X /> Undo
            </Button>
          )}
        </div>
      </div>

      <input
        ref={inputReference}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="sr-only"
        tabIndex={-1}
        aria-label={`Upload ${label.toLowerCase()}`}
        onChange={handleSelect}
      />
    </div>
  );
}
