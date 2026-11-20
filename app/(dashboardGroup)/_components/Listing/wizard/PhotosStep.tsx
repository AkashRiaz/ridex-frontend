"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Loader2,
  Star,
  Trash2,
} from "lucide-react";
import Swal from "sweetalert2";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FieldErrorText } from "@/components/ui/FieldErrorText";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VideoUrlZodSchema } from "@/components/validations/listing.validation";
import { LISTING_LIMITS } from "@/lib/enum";
import { validateImageFile } from "@/lib/toMultipart";
import { cn } from "@/lib/utils";
import { IListingImage } from "@/types";
import {
  deleteListingImageAction,
  reorderListingImagesAction,
  updateListingAction,
  uploadListingImageAction,
} from "../../../_actions/listingActions";
import { TWizardContext } from "./wizardTypes";

const sortImages = (images: IListingImage[]) =>
  images.slice().sort((first, second) => first.sortOrder - second.sortOrder);

const PhotosStep = ({ context }: { context: TWizardContext }) => {
  const { listing, onSaved, goToStep } = context;
  const inputReference = useRef<HTMLInputElement | null>(null);
  const [images, setImages] = useState<IListingImage[]>(() => sortImages(listing?.images ?? []));
  const [upload, setUpload] = useState<{ done: number; total: number } | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [videoUrl, setVideoUrl] = useState(listing?.videoUrl ?? "");
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!listing) return null;

  const remaining = LISTING_LIMITS.maxImages - images.length;
  const isBusy = isPending || upload !== null;

  // ── upload: one request per photo, sequential, with progress ──
  const handleFiles = async (fileList: FileList | null) => {
    const files = Array.from(fileList ?? []);

    if (files.length === 0) return;

    if (files.length > remaining) {
      toast.error(`You can add ${remaining} more photo${remaining === 1 ? "" : "s"}`);
      return;
    }

    const invalid = files.map((file) => ({ file, error: validateImageFile(file) })).find((item) => item.error);

    if (invalid) {
      toast.error(`${invalid.file.name}: ${invalid.error}`);
      return;
    }

    setUpload({ done: 0, total: files.length });
    let sentBackToReview = false;
    let uploaded = 0;

    for (const file of files) {
      const formData = new FormData();
      formData.append("image", file);

      const result = await uploadListingImageAction(listing.id, formData);

      if (!result.success || !result.data) {
        toast.error(result.message);
        break;
      }

      uploaded += 1;
      sentBackToReview ||= Boolean(result.data.sentBackToReview);
      setImages(sortImages(result.data.images));
      onSaved(result.data);
      setUpload({ done: uploaded, total: files.length });
    }

    setUpload(null);

    if (uploaded > 0) {
      const summary =
        uploaded === files.length ? "Photos added" : `${uploaded} of ${files.length} photos added`;
      toast.success(sentBackToReview ? `${summary} — sent for review again` : summary);
    }
  };

  // ── reorder / cover (optimistic, rolled back on failure) ──
  const saveOrder = (next: IListingImage[], coverImageId?: string) => {
    const previous = images;
    setImages(next.map((image, index) => ({ ...image, sortOrder: index })));

    startTransition(async () => {
      const result = await reorderListingImagesAction(
        listing.id,
        next.map((image) => image.id),
        coverImageId,
      );

      if (!result.success || !result.data) {
        setImages(previous);
        toast.error(result.message);
        return;
      }

      setImages(sortImages(result.data.images));
      onSaved(result.data);
    });
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= images.length || from === to) return;
    const next = [...images];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    saveOrder(next);
  };

  const makeCover = (imageId: string) => {
    const cover = images.find((image) => image.id === imageId);
    if (!cover) return;
    // the cover also moves to the first position
    saveOrder([cover, ...images.filter((image) => image.id !== imageId)], imageId);
    toast.success("Cover photo updated");
  };

  const removeImage = async (image: IListingImage, index: number) => {
    const confirmation = await Swal.fire({
      title: "Remove this photo?",
      text: `Photo ${index + 1} will be deleted.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Remove",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      reverseButtons: true,
    });

    if (!confirmation.isConfirmed) return;

    startTransition(async () => {
      const result = await deleteListingImageAction(listing.id, image.id);

      if (!result.success || !result.data) {
        toast.error(result.message);
        return;
      }

      setImages(sortImages(result.data.images));
      onSaved(result.data);
      toast.success("Photo removed");
    });
  };

  const handleContinue = () => {
    if (images.length === 0) {
      toast.error("Add at least one photo");
      return;
    }

    const video = VideoUrlZodSchema.safeParse(videoUrl);

    if (!video.success) {
      setVideoError(video.error.issues[0]?.message ?? "Invalid link");
      return;
    }

    setVideoError(null);

    if ((video.data || null) === (listing.videoUrl || null)) {
      goToStep(5);
      return;
    }

    startTransition(async () => {
      const result = await updateListingAction(listing.id, { videoUrl: video.data || null });

      if (!result.success || !result.data) {
        toast.error(result.message);
        return;
      }

      onSaved(result.data);
      goToStep(5);
    });
  };

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Photos & video</h2>
          <p className="text-sm text-muted-foreground">
            Add up to {LISTING_LIMITS.maxImages} photos (5MB each). Drag to reorder — the first photo is the cover.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => inputReference.current?.click()}
          disabled={isBusy || remaining <= 0}
        >
          {upload ? <Loader2 className="animate-spin" /> : <ImagePlus />}
          {upload ? `Uploading ${upload.done}/${upload.total}…` : "Add photos"}
        </Button>
        <input
          ref={inputReference}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          className="sr-only"
          tabIndex={-1}
          aria-label="Choose photos"
          onChange={(event) => {
            handleFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </div>

      {upload && (
        <div className="h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuemin={0} aria-valuemax={upload.total} aria-valuenow={upload.done} aria-label="Upload progress">
          <div className="h-full bg-primary transition-all" style={{ width: `${(upload.done / upload.total) * 100}%` }} />
        </div>
      )}

      {images.length === 0 ? (
        <button
          type="button"
          onClick={() => inputReference.current?.click()}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            handleFiles(event.dataTransfer.files);
          }}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-12 text-center transition hover:bg-muted/50 outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
        >
          <ImagePlus className="size-8 text-muted-foreground" aria-hidden="true" />
          <span className="font-medium">Drop photos here or click to choose</span>
          <span className="text-sm text-muted-foreground">Front, both sides, engine, odometer and papers work best</span>
        </button>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" aria-label="Listing photos">
          {images.map((image, index) => (
            <li
              key={image.id}
              draggable={!isBusy}
              onDragStart={() => setDragIndex(index)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                if (dragIndex !== null) move(dragIndex, index);
                setDragIndex(null);
              }}
              onDragEnd={() => setDragIndex(null)}
              className={cn(
                "group relative overflow-hidden rounded-xl border bg-muted",
                dragIndex === index && "opacity-50",
                image.isCover && "ring-2 ring-primary",
              )}
            >
              <div className="relative aspect-[4/3] cursor-grab active:cursor-grabbing">
                <Image src={image.url} alt={`Photo ${index + 1}`} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
              </div>

              {image.isCover && (
                <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                  Cover
                </span>
              )}

              <div className="flex items-center justify-between gap-1 border-t bg-card p-1.5">
                <div className="flex">
                  <Button type="button" variant="ghost" size="icon-sm" onClick={() => move(index, index - 1)} disabled={isBusy || index === 0} aria-label={`Move photo ${index + 1} left`}>
                    <ChevronLeft />
                  </Button>
                  <Button type="button" variant="ghost" size="icon-sm" onClick={() => move(index, index + 1)} disabled={isBusy || index === images.length - 1} aria-label={`Move photo ${index + 1} right`}>
                    <ChevronRight />
                  </Button>
                </div>
                <div className="flex">
                  {!image.isCover && (
                    <Button type="button" variant="ghost" size="icon-sm" onClick={() => makeCover(image.id)} disabled={isBusy} aria-label={`Make photo ${index + 1} the cover`} title="Make cover">
                      <Star />
                    </Button>
                  )}
                  <Button type="button" variant="ghost" size="icon-sm" onClick={() => removeImage(image, index)} disabled={isBusy} aria-label={`Remove photo ${index + 1}`}>
                    <Trash2 className="text-destructive" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="space-y-2 border-t pt-6">
        <Label htmlFor="listing-video">Video link (optional)</Label>
        <Input
          id="listing-video"
          type="url"
          inputMode="url"
          placeholder="https://www.youtube.com/watch?v=…"
          value={videoUrl}
          onChange={(event) => setVideoUrl(event.target.value)}
          aria-invalid={Boolean(videoError)}
        />
        <FieldErrorText show={Boolean(videoError)} errors={videoError ? [videoError] : []} />
        <p className="text-xs text-muted-foreground">YouTube links play on the listing page; other links open in a new tab.</p>
      </div>

      <div className="flex justify-between gap-3 border-t pt-5">
        <Button type="button" variant="ghost" onClick={() => goToStep(3)} disabled={isBusy}>
          <ArrowLeft /> Back
        </Button>
        <Button type="button" onClick={handleContinue} disabled={isBusy} className="min-w-36">
          {isPending ? <Loader2 className="animate-spin" /> : <ArrowRight />}
          Continue to review
        </Button>
      </div>
    </div>
  );
};

export default PhotosStep;
