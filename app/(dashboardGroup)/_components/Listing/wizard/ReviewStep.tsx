"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Circle, Loader2, RefreshCw, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { validateSpecValues, specsToFormValues } from "@/components/dynamicForm/buildSpecSchema";
import { formatMileage } from "@/components/listing/ListingBits";
import { findDistrict } from "@/lib/bdLocations";
import { LISTING_CONDITION_LABEL, LISTING_LIMITS } from "@/lib/enum";
import { formatCurrency } from "@/lib/formatCurrency";
import { cn } from "@/lib/utils";
import { renewListingAction, submitListingAction } from "../../../_actions/listingActions";
import { TWizardContext } from "./wizardTypes";

/*
 * Checklist (same rules as the API's submit check) + submit / renew.
 */
const ReviewStep = ({ context }: { context: TWizardContext }) => {
  const { listing, vehicleTypes, dashboardPath, onSaved, goToStep } = context;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (!listing) return null;

  const attributes =
    vehicleTypes.find((vehicleType) => vehicleType.id === listing.vehicleTypeId)?.attributes ??
    listing.vehicleType.attributes;

  const specsCheck = validateSpecValues(attributes, specsToFormValues(attributes, listing.specs));

  const checklist = [
    {
      label: `Title of at least ${LISTING_LIMITS.titleMin} characters`,
      done: listing.title.trim().length >= LISTING_LIMITS.titleMin,
      step: 3 as const,
    },
    { label: "Price set", done: listing.price >= LISTING_LIMITS.priceMin, step: 3 as const },
    { label: "Location chosen", done: Boolean(findDistrict(listing.division, listing.district)), step: 3 as const },
    { label: "Required specs filled", done: specsCheck.success, step: 2 as const },
    { label: "At least one photo", done: listing.images.length > 0, step: 4 as const },
  ];

  const isReady = checklist.every((item) => item.done);
  const canSubmit = listing.status === "DRAFT" || listing.status === "REJECTED";

  const handleSubmit = () => {
    startTransition(async () => {
      const result = await submitListingAction(listing.id);

      if (!result.success || !result.data) {
        toast.error(result.message);
        return;
      }

      onSaved(result.data);
      toast.success("Submitted! We'll let you know once it is approved.");
      router.push(`${dashboardPath}/my-listings?status=PENDING`);
    });
  };

  const handleRenew = () => {
    startTransition(async () => {
      const result = await renewListingAction(listing.id);

      if (!result.success || !result.data) {
        toast.error(result.message);
        return;
      }

      onSaved(result.data);
      toast.success("Listing renewed and live again");
      router.push(`${dashboardPath}/my-listings?status=APPROVED`);
    });
  };

  const summary = [
    ["Vehicle", [listing.brand.name, listing.vehicleModel?.name, listing.year].filter(Boolean).join(" ")],
    ["Price", `${formatCurrency(listing.price)}${listing.isNegotiable ? " (negotiable)" : ""}`],
    ["Condition", LISTING_CONDITION_LABEL[listing.condition]],
    ["Mileage", formatMileage(listing.mileage)],
    ["Location", [listing.area, listing.district, listing.division].filter(Boolean).join(", ") || "—"],
    ["Photos", String(listing.images.length)],
  ];

  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-lg font-semibold">Review</h2>
        <p className="text-sm text-muted-foreground">{listing.title}</p>
      </div>

      <dl className="grid gap-3 sm:grid-cols-2">
        {summary.map(([label, value]) => (
          <div key={label} className="rounded-xl bg-muted/50 p-3">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="mt-0.5 font-medium">{value}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="checklist-heading" className="space-y-2">
        <h3 id="checklist-heading" className="font-semibold">
          Ready to publish?
        </h3>
        <ul className="space-y-1.5">
          {checklist.map((item) => (
            <li key={item.label} className="flex items-center justify-between gap-3 text-sm">
              <span className={cn("inline-flex items-center gap-2", item.done ? "text-foreground" : "text-muted-foreground")}>
                {item.done ? (
                  <CheckCircle2 className="size-4 text-success" aria-label="Done" />
                ) : (
                  <Circle className="size-4" aria-label="Missing" />
                )}
                {item.label}
              </span>
              {!item.done && (
                <button type="button" className="text-sm font-medium text-primary hover:underline" onClick={() => goToStep(item.step)}>
                  Fix
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-wrap justify-between gap-3 border-t pt-5">
        <Button type="button" variant="ghost" onClick={() => goToStep(4)} disabled={isPending}>
          <ArrowLeft /> Back
        </Button>

        {canSubmit && (
          <Button type="button" onClick={handleSubmit} disabled={isPending || !isReady} className="min-w-44">
            {isPending ? <Loader2 className="animate-spin" /> : <Send />}
            {listing.status === "REJECTED" ? "Resubmit for review" : "Submit for review"}
          </Button>
        )}

        {listing.status === "EXPIRED" && (
          <Button type="button" onClick={handleRenew} disabled={isPending} className="min-w-36">
            {isPending ? <Loader2 className="animate-spin" /> : <RefreshCw />}
            Renew listing
          </Button>
        )}

        {(listing.status === "APPROVED" || listing.status === "PENDING") && (
          <Button type="button" onClick={() => router.push(`${dashboardPath}/my-listings`)}>
            Done
          </Button>
        )}
      </div>
    </div>
  );
};

export default ReviewStep;
