"use client";

import { ArrowLeft, Bike, Home, SearchX } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { siteConfig } from "@/lib/siteConfig";

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6 py-12">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[130px]" />

      <section className="relative z-10 mx-auto flex w-full max-w-2xl flex-col items-center text-center">
        <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-primary">
          <Bike className="size-5" aria-hidden="true" />
          {siteConfig.name}
        </div>

        <p className="mt-10 bg-gradient-to-b from-foreground to-primary bg-clip-text text-[9rem] font-black leading-[0.8] tracking-[-0.1em] text-transparent sm:text-[12rem]">
          404
        </p>

        <div className="mt-10 flex size-14 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
          <SearchX className="size-6" strokeWidth={1.8} aria-hidden="true" />
        </div>
        <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-5xl">
          We can&apos;t find that page
        </h1>
        <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-muted-foreground sm:text-base">
          The link may be broken, or this page may have moved.
        </p>

        <div className="mt-9 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground transition hover:-translate-y-0.5 hover:bg-primary/90"
          >
            <Home className="size-4" aria-hidden="true" />
            Back to home
          </Link>
          <button
            type="button"
            onClick={() => router.back()}
            className="group flex items-center justify-center gap-2 rounded-full border px-7 py-3 text-sm font-semibold transition hover:-translate-y-0.5 hover:bg-muted"
          >
            <ArrowLeft
              className="size-4 transition-transform group-hover:-translate-x-1"
              aria-hidden="true"
            />
            Go back
          </button>
        </div>
      </section>
    </main>
  );
}
