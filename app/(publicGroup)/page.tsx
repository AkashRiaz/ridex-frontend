import { siteConfig } from "@/lib/siteConfig";
import { Bike } from "lucide-react";

/*
 * Placeholder home. The real homepage (parallax hero, featured listings,
 * scroll animations) is built in Phase 1.
 */
const HomePage = () => {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center sm:py-32">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-elevated">
        <Bike className="size-8" aria-hidden="true" />
      </div>

      <h1 className="mt-8 text-4xl font-bold tracking-tight sm:text-6xl">
        {siteConfig.name}
      </h1>

      <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
        {siteConfig.tagline}
      </p>

      <p className="mt-10 rounded-full border px-4 py-1.5 text-xs text-muted-foreground">
        Foundation ready — features arrive in Phase 1
      </p>
    </section>
  );
};

export default HomePage;
