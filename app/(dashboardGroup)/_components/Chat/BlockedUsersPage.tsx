import { Suspense } from "react";
import { Ban } from "lucide-react";
import { CustomPagination } from "@/components/ui/CustomPagination";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { formatRelativeDate } from "@/components/listing/ListingBits";
import { ROLE_LABEL } from "@/lib/enum";
import { TSearchParams } from "@/types";
import { getMyBlockedUsersAction } from "../../_actions/userBlockActions";
import { CatalogError } from "../Catalog/CatalogStates";
import { UnblockButton } from "./BlockedUsers";

const BlockedListSkeleton = () => (
  <ul className="divide-y rounded-xl border" aria-hidden="true">
    {[1, 2, 3].map((row) => (
      <li key={row} className="flex items-center gap-3 p-4">
        <Skeleton className="size-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-40" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-8 w-20" />
      </li>
    ))}
  </ul>
);

const BlockedList = async ({ searchParams }: { searchParams?: TSearchParams }) => {
  const result = await getMyBlockedUsersAction({ query: searchParams });

  if (!result.success) {
    return <CatalogError title="Failed to load blocked users" message={result.message} />;
  }

  const blocks = result.data ?? [];

  if (blocks.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed p-12 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
          <Ban className="size-6 text-muted-foreground" aria-hidden="true" />
        </div>
        <h2 className="mt-4 text-lg font-semibold">You haven&apos;t blocked anyone</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Block someone from a conversation&apos;s menu to stop all messages between you.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ul className="divide-y rounded-xl border bg-card">
        {blocks.map((block) => (
          <li key={block.id} className="flex items-center gap-3 p-4">
            <UserAvatar name={block.user.name} imageUrl={block.user.imageUrl} size={40} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{block.user.isDeleted ? "Deleted user" : block.user.name}</p>
              <p className="text-xs text-muted-foreground">
                {ROLE_LABEL[block.user.role]} · blocked {formatRelativeDate(block.createdAt).toLowerCase()}
              </p>
            </div>
            <UnblockButton userId={block.user.id} name={block.user.name} />
          </li>
        ))}
      </ul>
      <CustomPagination
        currentPage={Math.max(1, Number(result.meta?.page ?? 1))}
        totalPages={Math.max(1, Number(result.meta?.totalPages ?? 1))}
      />
    </div>
  );
};

export const BlockedUsersPage = async ({ searchParams }: { searchParams?: Promise<TSearchParams> }) => {
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-3xl space-y-5 p-2 md:p-5">
      <div>
        <h1 className="text-xl font-semibold">Blocked users</h1>
        <p className="text-sm text-muted-foreground">
          Blocked people cannot message you, and you cannot message them.
        </p>
      </div>
      <Suspense key={JSON.stringify(params ?? {})} fallback={<BlockedListSkeleton />}>
        <BlockedList searchParams={params} />
      </Suspense>
    </div>
  );
};
