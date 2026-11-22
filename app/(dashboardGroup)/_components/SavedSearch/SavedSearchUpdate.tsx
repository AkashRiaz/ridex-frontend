"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Settings2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ISavedSearch } from "@/types";
import { updateSavedSearchAction } from "../../_actions/savedSearchActions";
import SavedSearchForm from "./SavedSearchForm";

/*
 * Rename a saved search and change its alerts.
 */
export default function SavedSearchUpdate({
  savedSearch,
  showLabel = false,
}: {
  savedSearch: Pick<ISavedSearch, "id" | "name" | "alertFrequency" | "notifyPriceDrops">;
  showLabel?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size={showLabel ? "sm" : "icon-sm"}
        onClick={() => setOpen(true)}
        aria-label={`Edit alerts for ${savedSearch.name}`}
        title="Edit name and alerts"
      >
        <Settings2 className="size-4" aria-hidden="true" />
        {showLabel && "Edit alerts"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit saved search</DialogTitle>
            <DialogDescription>The filters stay the same. To change them, save a new search.</DialogDescription>
          </DialogHeader>

          {open && (
            <SavedSearchForm
              nameRequired
              defaultValues={{
                name: savedSearch.name,
                alertFrequency: savedSearch.alertFrequency,
                notifyPriceDrops: savedSearch.notifyPriceDrops,
              }}
              submitLabel="Save changes"
              onCancel={() => setOpen(false)}
              onSubmit={async (value) => {
                const result = await updateSavedSearchAction(savedSearch.id, value);

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
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
