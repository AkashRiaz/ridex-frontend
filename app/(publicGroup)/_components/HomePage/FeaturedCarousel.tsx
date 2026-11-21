"use client";

import { Children, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/*
 * Horizontal, swipeable row with scroll-snap. Arrow buttons on wider screens.
 * Children are server-rendered cards; this only adds scrolling.
 */
export function FeaturedCarousel({ children, label }: { children: ReactNode; label: string }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateButtons = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    setCanPrev(track.scrollLeft > 4);
    setCanNext(track.scrollLeft + track.clientWidth < track.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    updateButtons();
    track.addEventListener("scroll", updateButtons, { passive: true });
    window.addEventListener("resize", updateButtons);

    return () => {
      track.removeEventListener("scroll", updateButtons);
      window.removeEventListener("resize", updateButtons);
    };
  }, [updateButtons]);

  const scrollByPage = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollBy({ left: direction * track.clientWidth * 0.9, behavior: reduceMotion ? "auto" : "smooth" });
  };

  return (
    <div className="relative">
      <ul
        ref={trackRef}
        aria-label={label}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-2 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:scroll-px-0 lg:px-0"
      >
        {Children.map(children, (child) => (
          <li className="w-[78%] shrink-0 snap-start sm:w-[45%] lg:w-[calc((100%-3rem)/4)]">{child}</li>
        ))}
      </ul>

      <div className="pointer-events-none absolute inset-y-0 -left-5 -right-5 hidden items-center justify-between lg:flex">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Previous listings"
          onClick={() => scrollByPage(-1)}
          disabled={!canPrev}
          className="glass pointer-events-auto rounded-full shadow-elevated disabled:opacity-0"
        >
          <ChevronLeft className="size-5" aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Next listings"
          onClick={() => scrollByPage(1)}
          disabled={!canNext}
          className="glass pointer-events-auto rounded-full shadow-elevated disabled:opacity-0"
        >
          <ChevronRight className="size-5" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
