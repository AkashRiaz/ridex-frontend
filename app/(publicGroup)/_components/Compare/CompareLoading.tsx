import { Skeleton } from "@/components/ui/skeleton";

export function CompareLoading({ columns }: { columns: number }) {
  const cols = Math.max(columns, 2);

  return (
    <div aria-hidden="true" className="overflow-hidden rounded-2xl border bg-card">
      <div className="grid gap-4 border-b p-4" style={{ gridTemplateColumns: `120px repeat(${cols}, minmax(0, 1fr))` }}>
        <span />
        {Array.from({ length: cols }).map((_, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
          <div key={index} className="space-y-2">
            <Skeleton className="aspect-[4/3] w-full rounded-xl" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-5 w-1/2" />
          </div>
        ))}
      </div>
      {Array.from({ length: 8 }).map((_, row) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
          key={row}
          className="grid gap-4 border-b px-4 py-3 last:border-b-0"
          style={{ gridTemplateColumns: `120px repeat(${cols}, minmax(0, 1fr))` }}
        >
          <Skeleton className="h-4 w-20" />
          {Array.from({ length: cols }).map((_, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
            <Skeleton key={index} className="h-4 w-3/4" />
          ))}
        </div>
      ))}
    </div>
  );
}
