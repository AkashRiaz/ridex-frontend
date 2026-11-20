import { LayoutDashboard } from "lucide-react";

/*
 * Shared placeholder until each role's overview (stats + charts) is built.
 */
const DashboardOverviewPlaceholder = ({ title }: { title: string }) => {
  return (
    <div className="mx-auto max-w-[1600px] p-2 md:p-5">
      <div className="rounded-2xl border bg-card p-10 text-center shadow-card">
        <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <LayoutDashboard className="size-6" aria-hidden="true" />
        </div>
        <h1 className="mt-4 text-2xl font-bold">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Overview stats and charts arrive with the Phase 1 dashboard endpoints.
        </p>
      </div>
    </div>
  );
};

export default DashboardOverviewPlaceholder;
