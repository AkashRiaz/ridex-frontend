import Link from "next/link";
import { AlertCircle, Eye, Mail, Phone } from "lucide-react";
import { CustomPagination } from "@/components/ui/CustomPagination";
import { SearchBar } from "@/components/ui/SearchBar";
import TableBackButton from "@/components/ui/TableBackButton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { RoleBadge, StatusBadge } from "@/components/shared/UserBadges";
import { canManageUser } from "@/lib/permissions";
import { Role, TSearchParams } from "@/types";
import { getAllUsersAction } from "../../_actions/userActions";
import UserDelete from "./UserDelete";
import { UserFilters } from "./UserFilters";
import UserRestore from "./UserRestore";
import UserStatusUpdate from "./UserStatusUpdate";

type UserTableProps = {
  searchParams?: TSearchParams;
  // e.g. "/admin-dashboard"
  dashboardPath: string;
  actor: { id: string; role: Role };
};

const UserTable = async ({ searchParams, dashboardPath, actor }: UserTableProps) => {
  const result = await getAllUsersAction({ query: searchParams });
  const users = result.data || [];
  const currentPage = Math.max(1, Number(result.meta?.page ?? 1));
  const limit = Math.max(1, Number(result.meta?.limit ?? 10));
  const totalPages = Math.max(1, Number(result.meta?.totalPages ?? 1));
  const canCreate = actor.role === "SUPER_ADMIN" || actor.role === "ADMIN";

  if (!result.success) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-card p-10 text-center shadow-sm">
        <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="size-5" />
        </div>
        <h3 className="mt-4 font-semibold text-destructive">Failed to load users</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {result.message || "Something went wrong while loading users."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-w-0 overflow-hidden">
      <div className="mx-1 flex flex-col gap-3 border-b py-4 sm:mx-2 lg:flex-row lg:items-center lg:justify-between md:mx-0">
        <div>
          <h2 className="text-lg font-semibold">
            <TableBackButton />
            Users
          </h2>
          <p className="text-sm text-muted-foreground">
            {result.meta?.total ?? users.length} accounts
          </p>
        </div>

        <div className="flex min-w-0 flex-wrap items-center gap-2 lg:justify-end">
          <SearchBar compact />
          {canCreate && (
            <Link
              href={`${dashboardPath}/create-user`}
              className="shrink-0 rounded-md bg-primary px-4 py-2 text-sm font-medium whitespace-nowrap text-primary-foreground transition hover:bg-primary/90"
            >
              Add User
            </Link>
          )}
        </div>
      </div>

      <div className="mx-1 py-3 sm:mx-2 md:mx-0">
        <UserFilters />
      </div>

      <div className="mx-1 overflow-x-auto sm:mx-2 md:mx-0">
        <Table className="min-w-[860px]">
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-14 font-semibold">#</TableHead>
              <TableHead className="font-semibold">User</TableHead>
              <TableHead className="font-semibold">Contact</TableHead>
              <TableHead className="font-semibold">Role</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Joined</TableHead>
              <TableHead className="text-right font-semibold">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user, index) => {
                const canManage = canManageUser(actor, user);

                return (
                  <TableRow key={user.id} className="transition-colors">
                    <TableCell className="font-medium text-muted-foreground">
                      {(currentPage - 1) * limit + index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <UserAvatar name={user.name} imageUrl={user.imageUrl} size={36} />
                        <p className="font-medium">{user.name}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="size-3.5" aria-hidden="true" />
                          {user.email || "-"}
                          {user.email && user.emailVerified && (
                            <span className="sr-only">(verified)</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="size-3.5" aria-hidden="true" />
                          {user.phone || "-"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <RoleBadge role={user.role} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={user.status} isDeleted={user.isDeleted} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`${dashboardPath}/users/${user.id}`}
                          className="inline-flex size-7 items-center justify-center rounded-md border transition hover:bg-muted"
                          aria-label={`View ${user.name}`}
                          title={`View ${user.name}`}
                        >
                          <Eye className="size-3.5" />
                        </Link>
                        {canManage &&
                          (user.isDeleted ? (
                            <UserRestore userId={user.id} userName={user.name} />
                          ) : (
                            <>
                              <UserStatusUpdate
                                userId={user.id}
                                userName={user.name}
                                status={user.status}
                              />
                              <UserDelete userId={user.id} userName={user.name} />
                            </>
                          ))}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <CustomPagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
};

export default UserTable;
