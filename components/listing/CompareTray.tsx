"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { GitCompareArrows, X } from "lucide-react";
import { useCompare } from "@/hooks/useCompare";
import { MAX_COMPARE_LISTINGS, compareHref } from "@/lib/compare";
import { cn } from "@/lib/utils";

/*
 * Floating bar with the compare list. Sits above the mobile bottom nav,
 * hidden on the compare page itself and when the list is empty.
 */
export function CompareTray() {
  const pathname = usePathname();
  const { items, remove, clear } = useCompare();
  const reduceMotion = useReducedMotion();

  const isVisible = items.length > 0 && pathname !== "/compare";
  const canCompare = items.length >= 2;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.section
          aria-label="Compare list"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-x-4 bottom-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom)+0.75rem)] z-40 mx-auto max-w-2xl lg:bottom-6"
        >
          <div className="glass flex items-center gap-3 rounded-2xl border p-2.5 shadow-elevated sm:p-3">
            <ul className="flex min-w-0 flex-1 items-center gap-2">
              {items.map((item) => (
                <li key={item.id} className="relative shrink-0">
                  <Link
                    href={`/listings/${item.slug}`}
                    title={item.title}
                    className="relative block size-11 overflow-hidden rounded-lg border bg-muted sm:size-12"
                  >
                    {item.coverImageUrl ? (
                      <Image src={item.coverImageUrl} alt={item.title} fill sizes="48px" className="object-cover" />
                    ) : (
                      <span className="flex size-full items-center justify-center p-1 text-center text-[10px] leading-tight text-muted-foreground">
                        {item.title.split(" ").slice(0, 2).join(" ")}
                      </span>
                    )}
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    aria-label={`Remove ${item.title} from compare`}
                    className="absolute -right-1.5 -top-1.5 inline-flex size-5 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-sm transition hover:text-foreground"
                  >
                    <X className="size-3" aria-hidden="true" />
                  </button>
                </li>
              ))}
              {Array.from({ length: MAX_COMPARE_LISTINGS - items.length }).map((_, index) => (
                <li
                  // biome-ignore lint/suspicious/noArrayIndexKey: empty placeholder slots
                  key={index}
                  aria-hidden="true"
                  className="hidden size-12 shrink-0 rounded-lg border border-dashed sm:block"
                />
              ))}
            </ul>

            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={clear}
                className="hidden h-9 rounded-lg px-3 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground sm:inline-flex sm:items-center"
              >
                Clear
              </button>
              <Link
                href={compareHref(items.map((item) => item.id))}
                aria-disabled={!canCompare}
                onClick={(event) => {
                  if (!canCompare) event.preventDefault();
                }}
                className={cn(
                  "inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90",
                  !canCompare && "cursor-not-allowed opacity-60 hover:bg-primary",
                )}
              >
                <GitCompareArrows className="size-4" aria-hidden="true" />
                {canCompare ? `Compare ${items.length}` : "Add 1 more"}
              </Link>
            </div>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
