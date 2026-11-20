"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AlertTriangle, Check, ExternalLink } from "lucide-react";
import { ListingStatusBadge } from "@/components/listing/ListingBits";
import { cn } from "@/lib/utils";
import { IBrand, IListingDetail, IVehicleType } from "@/types";
import DetailsStep from "./DetailsStep";
import PhotosStep from "./PhotosStep";
import ReviewStep from "./ReviewStep";
import SpecsStep from "./SpecsStep";
import VehicleStep from "./VehicleStep";
import { TWizardContext, TWizardStep, WIZARD_STEPS } from "./wizardTypes";

type ListingWizardProps = {
  listing?: IListingDetail;
  vehicleTypes: IVehicleType[];
  brands: IBrand[];
  dashboardPath: string;
  initialStep?: number;
};

const LIVE_NOTICE: Partial<Record<IListingDetail["status"], string>> = {
  APPROVED:
    "This listing is live. Price, negotiable, description, video and color update instantly. Changing the vehicle, specs, title, mileage, location or adding photos sends it back for review.",
  PENDING: "Waiting for review. You can still make changes — they will be reviewed together.",
  REJECTED: "This listing was rejected. Fix the issue and submit it again from the Review step.",
  EXPIRED: "This listing has expired. Renew it from the Review step to make it live again.",
};

/*
 * Multi-step create/edit. Step 1 creates a server draft; every later step autosaves.
 * The step lives in the URL (?step=3) so a draft can be resumed later.
 */
const ListingWizard = ({
  listing: initialListing,
  vehicleTypes,
  brands,
  dashboardPath,
  initialStep = 1,
}: ListingWizardProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [listing, setListing] = useState<IListingDetail | null>(initialListing ?? null);
  const [step, setStep] = useState<TWizardStep>(
    initialListing ? (Math.min(Math.max(initialStep, 1), 5) as TWizardStep) : 1,
  );

  const goToStep = (next: TWizardStep) => {
    setStep(next);
    if (listing) router.replace(`${pathname}?step=${next}`, { scroll: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const context: TWizardContext = {
    listing,
    vehicleTypes,
    brands,
    dashboardPath,
    onSaved: setListing,
    goToStep,
  };

  const notice = listing ? LIVE_NOTICE[listing.status] : undefined;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{listing ? "Edit listing" : "Sell your vehicle"}</h1>
          <p className="text-sm text-muted-foreground">
            {listing ? listing.title : "It takes about 5 minutes. Your draft is saved after every step."}
          </p>
        </div>
        {listing && (
          <div className="flex items-center gap-3">
            <ListingStatusBadge status={listing.status} />
            <Link
              href={`/listings/${listing.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              Preview <ExternalLink className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>

      {/* Stepper */}
      <nav aria-label="Listing steps">
        <ol className="grid grid-cols-5 gap-2">
          {WIZARD_STEPS.map((item) => {
            const isCurrent = item.id === step;
            const isDone = item.id < step;
            const isReachable = Boolean(listing) || item.id === 1;

            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => isReachable && goToStep(item.id)}
                  disabled={!isReachable}
                  aria-current={isCurrent ? "step" : undefined}
                  className={cn(
                    "flex w-full flex-col items-center gap-1.5 rounded-lg p-2 text-center text-xs font-medium transition outline-none",
                    "focus-visible:ring-3 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50",
                    isCurrent ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-8 items-center justify-center rounded-full border-2 text-sm",
                      isCurrent && "border-primary bg-primary text-primary-foreground",
                      isDone && "border-primary text-primary",
                    )}
                  >
                    {isDone ? <Check className="size-4" aria-hidden="true" /> : item.id}
                  </span>
                  <span className="hidden sm:block">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {notice && (
        <div role="status" className="flex items-start gap-3 rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {notice}
        </div>
      )}

      {listing?.status === "SOLD" ? (
        <div className="rounded-2xl border bg-card p-10 text-center">
          <h2 className="text-lg font-semibold">This listing is sold</h2>
          <p className="mt-1 text-sm text-muted-foreground">Sold listings can no longer be edited.</p>
        </div>
      ) : (
        <section className="rounded-2xl border bg-card p-5 shadow-card sm:p-7" aria-live="polite">
          {step === 1 && <VehicleStep context={context} />}
          {step === 2 && listing && <SpecsStep key={listing.vehicleTypeId} context={context} />}
          {step === 3 && listing && <DetailsStep context={context} />}
          {step === 4 && listing && <PhotosStep context={context} />}
          {step === 5 && listing && <ReviewStep context={context} />}
        </section>
      )}
    </div>
  );
};

export default ListingWizard;
