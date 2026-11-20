import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { USER_MANAGER_ROLES, USER_VIEWER_ROLES } from "@/lib/permissions";
import { getMe } from "@/service/getMe";
import { TSearchParams } from "@/types";
import UserCreate from "./UserCreate";
import UserDetails from "./UserDetails";
import UserLoadingTable from "./UserLoadingTable";
import UserTable from "./UserTable";

/*
 * Shared page bodies for /<role>-dashboard/users, /users/[userId] and /create-user.
 * The signed-in user (actor) decides which actions are shown.
 */

const getActor = async () => {
  const me = await getMe();

  if (!me.success || !me.data) return null;

  return { id: me.data.id, role: me.data.role };
};

export const UsersListPage = async ({
  searchParams,
  dashboardPath,
}: {
  searchParams?: Promise<TSearchParams>;
  dashboardPath: string;
}) => {
  const actor = await getActor();

  if (!actor || !USER_VIEWER_ROLES.includes(actor.role)) notFound();

  return (
    <div className="flex flex-col gap-4 p-2 md:p-5">
      <Suspense fallback={<UserLoadingTable />}>
        <UserTable
          searchParams={await searchParams}
          dashboardPath={dashboardPath}
          actor={actor}
        />
      </Suspense>
    </div>
  );
};

export const UserDetailsPage = async ({
  params,
  dashboardPath,
}: {
  params: Promise<{ userId: string }>;
  dashboardPath: string;
}) => {
  const [{ userId }, actor] = await Promise.all([params, getActor()]);

  if (!actor || !USER_VIEWER_ROLES.includes(actor.role)) notFound();

  return (
    <div className="mx-auto max-w-5xl p-2 md:p-5">
      <Suspense
        fallback={
          <div className="space-y-6">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-36 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
        }
      >
        <UserDetails
          userId={userId}
          actor={actor}
          listPath={`${dashboardPath}/users`}
        />
      </Suspense>
    </div>
  );
};

export const CreateUserPage = async ({ dashboardPath }: { dashboardPath: string }) => {
  const actor = await getActor();

  if (!actor || !USER_MANAGER_ROLES.includes(actor.role)) notFound();

  return (
    <div className="mx-auto max-w-3xl p-2 md:p-5">
      <UserCreate actorRole={actor.role} redirectTo={`${dashboardPath}/users`} />
    </div>
  );
};
