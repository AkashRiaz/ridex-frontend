"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, GitCompareArrows } from "lucide-react";
import { useCompare } from "@/hooks/useCompare";
import { compareHref } from "@/lib/compare";

/*
 * Empty state. With `fromStorage`, a saved compare list in this browser
 * is opened instead (the URL is the source of truth for what is shown).
 */
export function CompareEmpty({ fromStorage = false, hadListings = false }: { fromStorage?: boolean; hadListings?: boolean }) {
  const router = useRouter();
  const { items } = useCompare();

  useEffect(() => {
    if (fromStorage && items.length > 0) {
      router.replace(compareHref(items.map((item) => item.id)));
    }
  }, [fromStorage, items, router]);

  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-16 text-center">
      <span className="inline-flex size-12 items-center justify-center rounded-full bg-muted">
        <GitCompareArrows className="size-6 text-muted-foreground" aria-hidden="true" />
      </span>
      <h2 className="text-lg font-semibold">
        {hadListings ? "These listings are no longer available" : "Nothing to compare yet"}
      </h2>
      <p className="max-w-md text-sm text-muted-foreground">
        Tap the compare button on any listing to add it here. You can compare up to 4 listings of the same vehicle type.
      </p>
      <Link
        href="/listings"
        className="mt-2 inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
      >
        Browse listings
      </Link>
    </div>
  );
}

export function CompareError({ message }: { message: string }) {
  return (
    <div role="alert" className="flex items-start gap-3 rounded-2xl border border-destructive/40 bg-destructive/5 p-5 text-sm">
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
      <div className="space-y-2">
        <p className="font-medium">Couldn&apos;t compare these listings</p>
        <p className="text-muted-foreground">{message}</p>
        <Link href="/listings" className="font-medium text-primary hover:underline">
          Back to listings
        </Link>
      </div>
    </div>
  );
}

/*
 * Removes listings the server reported as gone from the stored compare list (once).
 */
export function CompareStorageSync({ missingIds }: { missingIds: string[] }) {
  const { remove } = useCompare();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    missingIds.forEach((id) => remove(id));
  }, [missingIds, remove]);

  if (missingIds.length === 0) return null;

  return (
    <p role="status" className="rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm">
      {missingIds.length === 1 ? "One listing was" : `${missingIds.length} listings were`} removed because{" "}
      {missingIds.length === 1 ? "it is" : "they are"} no longer for sale.
    </p>
  );
}
