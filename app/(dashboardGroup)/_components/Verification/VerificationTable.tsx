import Link from "next/link";
import { CustomPagination } from "@/components/ui/CustomPagination";
import { SearchBar } from "@/components/ui/SearchBar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UrlFilterSelect } from "@/components/shared/UrlFilterSelect";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { formatRelativeDate } from "@/components/listing/ListingBits";
import { ROLE_LABEL, VERIFICATION_STATUS_LABEL, VERIFICATION_TYPE_LABEL } from "@/lib/enum";
import { TSearchParams, TVerificationStatus } from "@/types";
import { getVerificationRequestsAction } from "../../_actions/verificationActions";
import { CatalogError } from "../Catalog/CatalogStates";
import { VerificationStatusBadge } from "./VerificationBits";

/*
 * Admin verification queue: status tabs, type filter, search, table, pagination.
 */

const getValue = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

const STATUS_TABS: (TVerificationStatus | "ALL")[] = ["PENDING", "APPROVED", "REJECTED", "ALL"];

const VerificationTable = async ({
  searchParams,
  dashboardPath,
}: {
  searchParams?: TSearchParams;
  dashboardPath: string;
}) => {
  const result = await getVerificationRequestsAction(searchParams);

  if (!result.success) {
    return <CatalogError title="Failed to load verification requests" message={result.message} />;
  }

  const requests = result.data ?? [];
  const counts = result.meta?.statusCounts ?? {};
  const active = (getValue(searchParams?.status) as TVerificationStatus | "ALL" | undefined) ?? "PENDING";
  const basePath = `${dashboardPath}/verifications`;
  const currentPage = Math.max(1, Number(result.meta?.page ?? 1));
  const limit = Math.max(1, Number(result.meta?.limit ?? 20));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs>
          <TabsList className="h-auto flex-wrap">
            {STATUS_TABS.map((status) => (
              <TabsTrigger
                key={status}
                href={status === "PENDING" ? basePath : `${basePath}?status=${status}`}
                active={active === status}
                replace
                scroll={false}
              >
                {status === "ALL" ? "All" : VERIFICATION_STATUS_LABEL[status]}
                {status !== "ALL" && <span className="ml-1.5 text-xs text-muted-foreground">{counts[status] ?? 0}</span>}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="flex flex-wrap gap-2">
          <UrlFilterSelect
            param="type"
            label="Type"
            allLabel="All types"
            options={(["ID", "DEALER"] as const).map((value) => ({ value, label: VERIFICATION_TYPE_LABEL[value] }))}
          />
          <SearchBar compact />
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table className="min-w-[760px]">
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              {["#", "User", "Type", "Documents", "Status", "Submitted", "Action"].map((column) => (
                <TableHead key={column} className={column === "Action" ? "text-right font-semibold" : "font-semibold"}>
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  {active === "PENDING" ? "No requests waiting. 🎉" : "No requests found."}
                </TableCell>
              </TableRow>
            ) : (
              requests.map((request, index) => (
                <TableRow key={request.id}>
                  <TableCell className="text-muted-foreground">{(currentPage - 1) * limit + index + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <UserAvatar name={request.user?.name ?? "?"} imageUrl={request.user?.imageUrl ?? null} size={36} />
                      <div className="min-w-0">
                        <p className="font-medium">{request.user?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {request.user?.email ?? request.user?.phone} · {request.user && ROLE_LABEL[request.user.role]}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{VERIFICATION_TYPE_LABEL[request.type]}</TableCell>
                  <TableCell className="text-sm">{request.documents.length}</TableCell>
                  <TableCell>
                    <VerificationStatusBadge status={request.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatRelativeDate(request.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`${basePath}/${request.id}`}
                      className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm font-medium transition hover:bg-muted"
                    >
                      {request.status === "PENDING" ? "Review" : "View"}
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CustomPagination currentPage={currentPage} totalPages={Math.max(1, Number(result.meta?.totalPages ?? 1))} />
    </div>
  );
};

export default VerificationTable;
