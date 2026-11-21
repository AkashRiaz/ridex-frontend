"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Camera, CircleCheck, Handshake, MessagesSquare, Search, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = {
  buy: {
    label: "Buying",
    steps: [
      {
        title: "Search and filter",
        text: "Filter by brand, price, engine size, ABS and distance from you.",
        icon: Search,
      },
      {
        title: "Chat safely",
        text: "Message the seller in the app. Your phone number stays private.",
        icon: MessagesSquare,
      },
      {
        title: "Meet and ride",
        text: "Check the bike in person, then rate the seller to help the next buyer.",
        icon: Handshake,
      },
    ],
  },
  sell: {
    label: "Selling",
    steps: [
      {
        title: "List in minutes",
        text: "Pick the model and we fill in the specs. Add photos and your price.",
        icon: Camera,
      },
      {
        title: "Get approved",
        text: "A moderator checks every listing, so buyers trust what they see.",
        icon: ShieldCheck,
      },
      {
        title: "Close the deal",
        text: "Answer buyers in one inbox and mark the bike sold when it's gone.",
        icon: CircleCheck,
      },
    ],
  },
} as const;

type TAudience = keyof typeof STEPS;

/*
 * Two tabs (buying / selling), each with three steps.
 * Keyboard: arrow keys move between tabs (WAI-ARIA tabs pattern).
 */
const HowItWorks = () => {
  const [audience, setAudience] = useState<TAudience>("buy");
  const reduceMotion = useReducedMotion();
  const baseId = useId();
  const audiences = Object.keys(STEPS) as TAudience[];

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;

    event.preventDefault();
    const next = audiences[(audiences.indexOf(audience) + 1) % audiences.length];
    setAudience(next);
    document.getElementById(`${baseId}-tab-${next}`)?.focus();
  };

  return (
    <div className="rounded-3xl border bg-card p-5 shadow-card sm:p-8">
      <div role="tablist" aria-label="How it works for" className="inline-flex rounded-full bg-muted p-1">
        {audiences.map((key) => {
          const selected = key === audience;

          return (
            <button
              key={key}
              id={`${baseId}-tab-${key}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`${baseId}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setAudience(key)}
              onKeyDown={onKeyDown}
              className={cn(
                "relative rounded-full px-5 py-2 text-sm font-medium transition-colors",
                selected ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {selected && (
                <motion.span
                  layoutId={`${baseId}-pill`}
                  className="absolute inset-0 rounded-full bg-primary"
                  transition={reduceMotion ? { duration: 0 } : { type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
              <span className="relative">{STEPS[key].label}</span>
            </button>
          );
        })}
      </div>

      <div
        id={`${baseId}-panel`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${audience}`}
        className="mt-6"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.ol
            key={audience}
            className="grid gap-4 md:grid-cols-3"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {STEPS[audience].steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <li key={step.title} className="relative rounded-2xl bg-muted/50 p-5">
                  <span className="absolute right-5 top-4 font-heading text-4xl font-bold text-foreground/5">
                    {index + 1}
                  </span>
                  <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-semibold">{step.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{step.text}</p>
                </li>
              );
            })}
          </motion.ol>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default HowItWorks;
