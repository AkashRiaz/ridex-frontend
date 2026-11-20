"use client";

import { useEffect, useMemo, useRef } from "react";
import { Camera, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/shared/UserAvatar";

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

type AvatarUploadProps = {
  name: string;
  currentImageUrl: string | null;
  file: File | null;
  onFileChange: (file: File | null) => void;
  disabled?: boolean;
};

const AvatarUpload = ({
  name,
  currentImageUrl,
  file,
  onFileChange,
  disabled = false,
}: AvatarUploadProps) => {
  const inputReference = useRef<HTMLInputElement | null>(null);

  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );

  // free the blob URL when the file changes or the component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    event.target.value = "";

    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }

    if (selected.size > MAX_AVATAR_SIZE) {
      toast.error("Avatar must be 5MB or smaller");
      return;
    }

    onFileChange(selected);
  };

  const shownImage = file ? previewUrl : currentImageUrl;

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        {shownImage && file ? (
          // blob: preview, next/image does not handle object URLs
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={shownImage}
            alt="New avatar preview"
            className="size-20 rounded-full object-cover"
          />
        ) : (
          <UserAvatar name={name} imageUrl={currentImageUrl} size={80} />
        )}

        <button
          type="button"
          onClick={() => inputReference.current?.click()}
          disabled={disabled}
          className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow transition hover:bg-primary/90 disabled:opacity-50"
          aria-label="Change avatar"
        >
          <Camera className="size-4" aria-hidden="true" />
        </button>
      </div>

      <div className="space-y-1">
        <p className="text-sm font-medium">Profile photo</p>
        <p className="text-xs text-muted-foreground">JPG, PNG, WebP or AVIF, up to 5MB</p>
        {file && (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => onFileChange(null)}
            disabled={disabled}
          >
            <X /> Keep current photo
          </Button>
        )}
      </div>

      <input
        ref={inputReference}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="sr-only"
        tabIndex={-1}
        onChange={handleSelect}
      />
    </div>
  );
};

export default AvatarUpload;
