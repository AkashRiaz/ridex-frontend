"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BellPlus, BellRing } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ISavedSearchLookup } from "@/types";
import { createSavedSearchAction } from "../../_actions/savedSearchActions";
import SavedSearchForm from "./SavedSearchForm";

// URL params that are not search filters
const NON_FILTER_PARAMS = ["page", "limit", "sortBy", "view"];

type SavedSearchCreateProps = {
  isSignedIn: boolean;
  // the signed-in user's dashboard (null for roles without saved searches)
  dashboardPath: string | null;
  existing: ISavedSearchLookup["savedSearch"];
};

/*
 * "Save search" on the search page. Signed-out visitors go to login and come
 * back; an already-saved search links to its page instead.
 */
export default function SavedSearchCreate({ isSignedIn, dashboardPath, existing }: SavedSearchCreateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const query = Object.fromEntries(
    [...searchParams.entries()].filter(([key, value]) => !NON_FILTER_PARAMS.includes(key) && value !== ""),
  );
  const hasFilters = Object.keys(query).length > 0;

  // staff roles have no saved searches page
  if (isSignedIn && !dashboardPath) return null;

  if (existing && dashboardPath) {
    return (
      <Link
        href={`${dashboardPath}/saved-searches/${existing.id}`}
        title={`Saved as “${existing.name}”`}
        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/5 px-3 text-sm font-medium text-primary transition hover:bg-primary/10"
      >
        <BellRing className="size-4" aria-hidden="true" />
        Saved search
      </Link>
    );
  }

  const handleOpen = () => {
    if (!isSignedIn) {
      const current = searchParams.toString();
      router.push(`/login?redirectTo=${encodeURIComponent(current ? `${pathname}?${current}` : pathname)}`);
      return;
    }

    setOpen(true);
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleOpen}
        disabled={!hasFilters}
        title={hasFilters ? "Get alerts for new listings that match" : "Choose at least one filter to save this search"}
      >
        <BellPlus className="size-4" aria-hidden="true" />
        Save search
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save this search</DialogTitle>
            <DialogDescription>
              We&apos;ll alert you when a new listing matches these filters, or when a matching one drops its price.
            </DialogDescription>
          </DialogHeader>

          <SavedSearchForm
            nameRequired={false}
            defaultValues={{ name: "", alertFrequency: "INSTANT", notifyPriceDrops: true }}
            submitLabel="Save search"
            onCancel={() => setOpen(false)}
            onSubmit={async (value) => {
              const result = await createSavedSearchAction({
                query,
                ...(value.name ? { name: value.name } : {}),
                alertFrequency: value.alertFrequency,
                notifyPriceDrops: value.notifyPriceDrops,
              });

              if (!result.success) {
                toast.error(result.message);
                return false;
              }

              toast.success(result.message);
              setOpen(false);
              router.refresh();
              return true;
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
