import TableBackButton from "@/components/ui/TableBackButton";
import { SearchBar } from "@/components/ui/SearchBar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const UserLoadingTable = () => {
  return (
    <div className="min-w-0 overflow-hidden" aria-busy="true">
      <div className="mx-1 flex flex-col gap-3 border-b py-4 sm:mx-2 lg:flex-row lg:items-center lg:justify-between md:mx-0">
        <div>
          <h2 className="text-lg font-semibold">
            <TableBackButton />
            Users
          </h2>
          <Skeleton className="mt-1 h-4 w-24" />
        </div>
        <SearchBar compact />
      </div>

      <div className="mx-1 flex gap-2 py-3 sm:mx-2 md:mx-0">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-8 w-36" />
      </div>

      <div className="mx-1 overflow-x-auto sm:mx-2 md:mx-0">
        <Table className="min-w-[860px]">
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              {["#", "User", "Contact", "Role", "Status", "Joined", "Action"].map((head) => (
                <TableHead key={head} className="font-semibold">
                  {head}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 8 }).map((_, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton rows
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-4 w-6" />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-9 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-44" />
                  <Skeleton className="mt-2 h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Skeleton className="size-7" />
                    <Skeleton className="size-7" />
                    <Skeleton className="size-7" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UserLoadingTable;
