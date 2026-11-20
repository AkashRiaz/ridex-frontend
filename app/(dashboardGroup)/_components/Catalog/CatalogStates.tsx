import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TableBackButton from "@/components/ui/TableBackButton";

/*
 * Error card used by every catalog table/detail (reference error-state markup).
 */
export function CatalogError({ title, message }: { title: string; message?: string }) {
  return (
    <div className="rounded-xl border border-destructive/20 bg-card p-10 text-center shadow-sm">
      <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertCircle className="size-5" />
      </div>
      <h3 className="mt-4 font-semibold text-destructive">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {message || "Something went wrong. Please try again."}
      </p>
    </div>
  );
}

/*
 * Skeleton table (reference <Entity>LoadingTable pattern).
 */
export function CatalogLoadingTable({
  title,
  columns,
  rows = 8,
}: {
  title: string;
  columns: string[];
  rows?: number;
}) {
  return (
    <div className="min-w-0 overflow-hidden" aria-busy="true">
      <div className="mx-1 flex flex-col gap-3 border-b py-4 sm:mx-2 md:mx-0 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            <TableBackButton />
            {title}
          </h2>
          <Skeleton className="mt-1 h-4 w-28" />
        </div>
        <Skeleton className="h-9 w-64" />
      </div>
      <div className="mx-1 overflow-x-auto pt-3 sm:mx-2 md:mx-0">
        <Table className="min-w-[760px]">
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              {columns.map((column) => (
                <TableHead key={column} className="font-semibold">
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton rows
              <TableRow key={rowIndex}>
                {columns.map((column) => (
                  <TableCell key={column}>
                    <Skeleton className="h-4 w-full max-w-32" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
