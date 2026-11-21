"use client";

import Link from "next/link";
import { ArrowRight, Bike } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { useRealtime } from "@/hooks/useSocket";
import { getSellHref } from "@/lib/navigation";

// copy per audience; staff (no sell link) don't see the banner
const COPY = {
  visitor: {
    title: "Got a bike to sell?",
    text: "Create a free account and list it in minutes. Buyers message you directly.",
    cta: "Start selling",
  },
  buyer: {
    title: "Ready to sell your bike?",
    text: "Switch your account to a seller account from your dashboard. It's free.",
    cta: "Become a seller",
  },
  seller: {
    title: "List your next bike",
    text: "Your buyers are already here. Add photos and a fair price to sell faster.",
    cta: "Create a listing",
  },
};

/*
 * Role comes from the realtime context (the layout already loaded the user),
 * so the homepage doesn't fetch the user a second time.
 */
const SellCTA = () => {
  const { userId, role } = useRealtime();
  const href = getSellHref(userId ? role : null);

  if (!href) return null;

  const copy = !userId ? COPY.visitor : role === "BUYER" ? COPY.buyer : COPY.seller;

  return (
    <Reveal className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="relative isolate overflow-hidden rounded-3xl bg-primary px-6 py-10 text-primary-foreground shadow-elevated sm:px-12 sm:py-14">
        <div aria-hidden="true" className="absolute -right-16 -top-16 -z-10 size-72 rounded-full bg-white/15 blur-3xl" />
        <Bike
          aria-hidden="true"
          className="absolute -bottom-6 right-6 -z-10 size-40 animate-float text-white/15 sm:size-56"
          strokeWidth={1.25}
        />
        <div className="max-w-xl">
          <h2 className="text-2xl font-bold tracking-tight sm:text-4xl">{copy.title}</h2>
          <p className="mt-3 text-primary-foreground/85 sm:text-lg">{copy.text}</p>
          <Link
            href={href}
            className="group mt-6 inline-flex items-center gap-2 rounded-full bg-background px-5 py-2.5 text-sm font-semibold text-foreground shadow-card transition hover:shadow-elevated active:scale-95"
          >
            {copy.cta}
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </Reveal>
  );
};

export default SellCTA;
