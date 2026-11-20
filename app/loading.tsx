import { Bike, LoaderCircle } from "lucide-react";
import { siteConfig } from "@/lib/siteConfig";

export default function Loading() {
  return (
    <main
      className="flex min-h-screen items-center justify-center bg-background px-6"
      aria-busy="true"
    >
      <section className="flex flex-col items-center text-center">
        <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-primary">
          <Bike className="size-5" aria-hidden="true" />
          {siteConfig.name}
        </div>

        <LoaderCircle
          className="mt-10 size-10 animate-spin text-primary"
          aria-hidden="true"
        />

        <p className="mt-6 text-sm text-muted-foreground" role="status">
          Loading…
        </p>
      </section>
    </main>
  );
}
