"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Calculator, CircleAlert, FileCheck2, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LOAN_RATE_MAX_PERCENT,
  TENURE_OPTIONS,
  buildLoanTerms,
  formatRate,
  minDownPaymentFor,
} from "@/lib/emi";
import { LOAN_LEAD_STATUS_LABEL } from "@/lib/enum";
import { formatCurrency } from "@/lib/formatCurrency";
import { cn } from "@/lib/utils";
import { IActiveFinancePartners, IFinancePartnerCard, ILoanLead } from "@/types";
import { LoanLeadDialog, TLoanLeadApplicantDefaults, TLoanTerms } from "./LoanLeadDialog";

type EmiCalculatorProps = {
  listing: { id: string; title: string; price: number };
  finance: IActiveFinancePartners;
  // what the viewer may do: "apply" (buyer roles), "sign-in" (visitor), "none" (owner, staff)
  mode: "apply" | "sign-in" | "none";
  openLead: ILoanLead | null;
  dashboardPath: string | null;
  applicant: TLoanLeadApplicantDefaults;
};

// down payment slider steps: round numbers for any price
const stepFor = (price: number) => (price >= 1_000_000 ? 10_000 : price >= 100_000 ? 1_000 : 100);

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/*
 * Problems with the current terms for the chosen partner (shown as hints;
 * the server enforces the same rules).
 */
const partnerIssues = (
  partner: IFinancePartnerCard | null,
  terms: { downPayment: number; tenureMonths: number; interestRate: number },
  price: number,
) => {
  if (!partner) return [];

  const issues: string[] = [];
  const minDown = minDownPaymentFor(price, [partner.minDownPaymentPercent]);

  if (terms.downPayment < minDown) {
    issues.push(`${partner.name} needs at least ${partner.minDownPaymentPercent}% down (${formatCurrency(minDown)}).`);
  }
  if (terms.tenureMonths > partner.maxTenureMonths) {
    issues.push(`${partner.name} lends for at most ${partner.maxTenureMonths} months.`);
  }
  if (terms.interestRate < partner.interestRateMin || terms.interestRate > partner.interestRateMax) {
    issues.push(
      `${partner.name} offers ${formatRate(partner.interestRateMin)}–${formatRate(partner.interestRateMax)} a year.`,
    );
  }

  return issues;
};

/*
 * EMI calculator on the listing page (+ "Apply for financing").
 * Pure maths in the browser (lib/emi.ts); nothing is saved until the buyer applies.
 */
export function EmiCalculator({ listing, finance, mode, openLead, dashboardPath, applicant }: EmiCalculatorProps) {
  const id = useId();
  const router = useRouter();
  const pathname = usePathname();
  const { price } = listing;
  const { partners, defaults } = finance;

  const platformMinDown = minDownPaymentFor(price, [defaults.minDownPaymentPercent]);
  const maxDown = Math.floor(price * 0.9);
  const step = stepFor(price);

  const [downPayment, setDownPayment] = useState(() =>
    clamp(Math.ceil((price * Math.max(20, defaults.minDownPaymentPercent)) / 100 / step) * step, platformMinDown, maxDown),
  );
  const [tenureMonths, setTenureMonths] = useState(24);
  const [rateText, setRateText] = useState(String(defaults.interestRate));
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const partner = partners.find((item) => item.id === partnerId) ?? null;
  const rate = Number(rateText);
  const isRateValid = rateText.trim() !== "" && Number.isFinite(rate) && rate >= 0 && rate <= LOAN_RATE_MAX_PERCENT;
  const interestRate = isRateValid ? rate : defaults.interestRate;

  const terms = useMemo(
    () => buildLoanTerms({ listingPrice: price, downPayment, tenureMonths, interestRate }),
    [price, downPayment, tenureMonths, interestRate],
  );

  const downPercent = Math.round((downPayment / price) * 100);
  const issues = partnerIssues(partner, { downPayment, tenureMonths, interestRate }, price);
  const belowPlatformMin = downPayment < platformMinDown;
  const canSubmit = isRateValid && !belowPlatformMin && issues.length === 0 && terms.loanAmount > 0;
  const interestShare = terms.totalPayable > 0 ? (terms.totalInterest / terms.totalPayable) * 100 : 0;

  const choosePartner = (next: IFinancePartnerCard | null) => {
    setPartnerId(next?.id ?? null);

    if (!next) {
      setRateText(String(defaults.interestRate));
      return;
    }

    // start from the partner's best rate and fit the terms into its limits
    setRateText(String(next.interestRateMin));
    setTenureMonths((current) => Math.min(current, next.maxTenureMonths));
    setDownPayment((current) =>
      clamp(Math.max(current, minDownPaymentFor(price, [next.minDownPaymentPercent, defaults.minDownPaymentPercent])), 0, maxDown),
    );
  };

  const loanTerms: TLoanTerms = { downPayment, tenureMonths, interestRate, ...terms };

  return (
    <section aria-labelledby={`${id}-heading`} className="space-y-4 rounded-2xl border bg-card p-5 shadow-card">
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Calculator className="size-4" aria-hidden="true" />
        </span>
        <div>
          <h2 id={`${id}-heading`} className="font-semibold">
            EMI calculator
          </h2>
          <p className="text-xs text-muted-foreground">See what this would cost per month.</p>
        </div>
      </div>

      {/* Down payment */}
      <div className="space-y-2">
        <div className="flex items-baseline justify-between gap-2">
          <Label htmlFor={`${id}-down`}>Down payment</Label>
          <span className="text-xs text-muted-foreground">{downPercent}% of the price</span>
        </div>
        <input
          id={`${id}-down-range`}
          type="range"
          min={0}
          max={maxDown}
          step={step}
          value={downPayment}
          onChange={(event) => setDownPayment(Number(event.target.value))}
          className="w-full accent-primary"
          aria-label="Down payment amount"
          aria-valuetext={`${formatCurrency(downPayment)}, ${downPercent}% of the price`}
        />
        <Input
          id={`${id}-down`}
          type="number"
          inputMode="numeric"
          min={0}
          max={maxDown}
          step={step}
          value={downPayment}
          onChange={(event) => setDownPayment(clamp(Math.round(Number(event.target.value) || 0), 0, maxDown))}
          aria-describedby={belowPlatformMin ? `${id}-down-hint` : undefined}
        />
        {belowPlatformMin && (
          <p id={`${id}-down-hint`} className="text-xs text-destructive">
            The down payment must be at least {defaults.minDownPaymentPercent}% ({formatCurrency(platformMinDown)}).
          </p>
        )}
      </div>

      {/* Tenure */}
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Tenure</legend>
        <div className="flex flex-wrap gap-1.5">
          {TENURE_OPTIONS.map((months) => {
            const tooLong = Boolean(partner && months > partner.maxTenureMonths);

            return (
              <button
                key={months}
                type="button"
                onClick={() => setTenureMonths(months)}
                disabled={tooLong}
                aria-pressed={tenureMonths === months}
                className={cn(
                  "rounded-full border px-3 py-1 text-sm transition focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none",
                  tenureMonths === months ? "border-primary bg-primary/10 font-medium text-primary" : "hover:bg-muted",
                  tooLong && "cursor-not-allowed opacity-40 hover:bg-transparent",
                )}
              >
                {months} mo
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Rate */}
      <div className="space-y-2">
        <Label htmlFor={`${id}-rate`}>Interest rate (% a year)</Label>
        <Input
          id={`${id}-rate`}
          type="number"
          inputMode="decimal"
          min={0}
          max={LOAN_RATE_MAX_PERCENT}
          step={0.25}
          value={rateText}
          onChange={(event) => setRateText(event.target.value)}
          aria-invalid={!isRateValid}
        />
        {!isRateValid && <p className="text-xs text-destructive">Enter a rate between 0 and {LOAN_RATE_MAX_PERCENT}%.</p>}

        {partners.length > 0 && (
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Finance partner rates">
            <button
              type="button"
              onClick={() => choosePartner(null)}
              aria-pressed={!partner}
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs transition focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none",
                !partner ? "border-primary bg-primary/10 font-medium text-primary" : "hover:bg-muted",
              )}
            >
              Typical {formatRate(defaults.interestRate)}
            </button>
            {partners.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => choosePartner(item)}
                aria-pressed={partner?.id === item.id}
                title={`Down payment from ${item.minDownPaymentPercent}%, up to ${item.maxTenureMonths} months`}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none",
                  partner?.id === item.id ? "border-primary bg-primary/10 font-medium text-primary" : "hover:bg-muted",
                )}
              >
                <Landmark className="size-3" aria-hidden="true" />
                {item.name} · {formatRate(item.interestRateMin)}–{formatRate(item.interestRateMax)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Result */}
      <div className="space-y-3 rounded-xl bg-muted/50 p-4" aria-live="polite" aria-atomic="true">
        <div>
          <p className="text-xs text-muted-foreground">Estimated monthly EMI</p>
          <p className="text-2xl font-bold tabular-nums">{formatCurrency(terms.estimatedEmi)}</p>
          <p className="text-xs text-muted-foreground">
            for {tenureMonths} months at {formatRate(interestRate)}
          </p>
        </div>

        <div
          className="flex h-2 overflow-hidden rounded-full bg-background"
          role="img"
          aria-label={`Principal ${Math.round(100 - interestShare)}%, interest ${Math.round(interestShare)}% of the total`}
        >
          <span className="bg-primary motion-safe:transition-all" style={{ width: `${100 - interestShare}%` }} />
          <span className="bg-warning motion-safe:transition-all" style={{ width: `${interestShare}%` }} />
        </div>

        <dl className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <dt className="flex items-center gap-1 text-muted-foreground">
              <span className="size-2 rounded-full bg-primary" aria-hidden="true" />
              Loan
            </dt>
            <dd className="font-semibold tabular-nums">{formatCurrency(terms.loanAmount)}</dd>
          </div>
          <div>
            <dt className="flex items-center gap-1 text-muted-foreground">
              <span className="size-2 rounded-full bg-warning" aria-hidden="true" />
              Interest
            </dt>
            <dd className="font-semibold tabular-nums">{formatCurrency(terms.totalInterest)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Total cost</dt>
            <dd className="font-semibold tabular-nums">{formatCurrency(terms.totalPayable + downPayment)}</dd>
          </div>
        </dl>
      </div>

      {issues.length > 0 && (
        <ul className="space-y-1 rounded-lg border border-warning/40 bg-warning/10 p-3 text-xs">
          {issues.map((issue) => (
            <li key={issue} className="flex gap-1.5">
              <CircleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              {issue}
            </li>
          ))}
        </ul>
      )}

      {/* Call to action */}
      {openLead && dashboardPath ? (
        <Link
          href={`${dashboardPath}/financing-requests/${openLead.id}`}
          className="flex items-center justify-between gap-2 rounded-lg border border-primary/40 bg-primary/5 px-3 py-2.5 text-sm font-medium text-primary transition hover:bg-primary/10"
        >
          <span className="inline-flex items-center gap-1.5">
            <FileCheck2 className="size-4" aria-hidden="true" />
            Request sent · {LOAN_LEAD_STATUS_LABEL[openLead.status]}
          </span>
          <span className="text-xs">View status</span>
        </Link>
      ) : mode === "apply" ? (
        <Button type="button" className="w-full" onClick={() => setDialogOpen(true)} disabled={!canSubmit}>
          <Landmark aria-hidden="true" />
          Apply for financing
        </Button>
      ) : mode === "sign-in" ? (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => router.push(`/login?redirectTo=${encodeURIComponent(pathname)}`)}
        >
          <Landmark aria-hidden="true" />
          Sign in to apply for financing
        </Button>
      ) : null}

      <p className="text-[11px] leading-relaxed text-muted-foreground">
        An estimate only. The finance partner sets the final rate, fees and terms after checking your application.
      </p>

      {mode === "apply" && (
        <LoanLeadDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          listing={listing}
          terms={loanTerms}
          partner={partner}
          applicant={applicant}
          onSent={() => router.refresh()}
        />
      )}
    </section>
  );
}

export function EmiCalculatorSkeleton() {
  return (
    <div className="space-y-4 rounded-2xl border bg-card p-5" aria-busy="true" aria-label="Loading EMI calculator">
      <div className="flex items-center gap-3">
        <Skeleton className="size-9 rounded-xl" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="h-9 w-full" />
      <div className="flex gap-1.5">
        {Array.from({ length: 5 }).map((_, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
          <Skeleton key={index} className="h-7 w-14 rounded-full" />
        ))}
      </div>
      <Skeleton className="h-28 w-full rounded-xl" />
    </div>
  );
}
