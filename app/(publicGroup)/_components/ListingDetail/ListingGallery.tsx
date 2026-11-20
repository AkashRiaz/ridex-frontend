"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ListingImagePlaceholder } from "@/components/listing/ListingBits";
import { cn } from "@/lib/utils";
import { IListingImage } from "@/types";

/*
 * Main photo + thumbnails. Arrow buttons, keyboard arrows and swipe.
 */
export function ListingGallery({ images, title }: { images: IListingImage[]; title: string }) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  if (images.length === 0) {
    return (
      <div className="aspect-[4/3] overflow-hidden rounded-2xl border">
        <ListingImagePlaceholder label={title} />
      </div>
    );
  }

  const count = images.length;
  const go = (next: number) => setIndex((next + count) % count);
  const current = images[index];

  return (
    <div className="space-y-3">
      <div
        className="group relative aspect-[4/3] overflow-hidden rounded-2xl border bg-muted outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        role="region"
        aria-roledescription="carousel"
        aria-label={`Photos of ${title}`}
        // biome-ignore lint/a11y/noNoninteractiveTabindex: keyboard navigation for the gallery
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") go(index - 1);
          if (event.key === "ArrowRight") go(index + 1);
        }}
        onTouchStart={(event) => {
          touchStartX.current = event.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(event) => {
          if (touchStartX.current === null) return;
          const deltaX = (event.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
          if (Math.abs(deltaX) > 40) go(deltaX < 0 ? index + 1 : index - 1);
          touchStartX.current = null;
        }}
      >
        <Image
          key={current.id}
          src={current.url}
          alt={`${title} — photo ${index + 1} of ${count}`}
          fill
          priority={index === 0}
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="object-contain"
        />

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(index - 1)}
              className="absolute left-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 shadow backdrop-blur transition hover:bg-background"
              aria-label="Previous photo"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              className="absolute right-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 shadow backdrop-blur transition hover:bg-background"
              aria-label="Next photo"
            >
              <ChevronRight className="size-5" />
            </button>
            <span
              className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs text-white"
              aria-live="polite"
            >
              {index + 1} / {count}
            </span>
          </>
        )}
      </div>

      {count > 1 && (
        <ul className="flex gap-2 overflow-x-auto pb-1" aria-label="Choose a photo">
          {images.map((image, imageIndex) => (
            <li key={image.id} className="shrink-0">
              <button
                type="button"
                onClick={() => setIndex(imageIndex)}
                aria-label={`Show photo ${imageIndex + 1}`}
                aria-current={imageIndex === index}
                className={cn(
                  "relative block h-16 w-20 overflow-hidden rounded-lg border-2 transition outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  imageIndex === index ? "border-primary" : "border-transparent opacity-70 hover:opacity-100",
                )}
              >
                <Image src={image.url} alt="" fill sizes="80px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
