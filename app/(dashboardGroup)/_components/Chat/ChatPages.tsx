import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle, ShieldCheck } from "lucide-react";
import { CustomPagination } from "@/components/ui/CustomPagination";
import { SearchBar } from "@/components/ui/SearchBar";
import { Skeleton } from "@/components/ui/skeleton";
import { getDashboardPath } from "@/lib/dashboardPath";
import { cn } from "@/lib/utils";
import { getMe } from "@/service/getMe";
import { TSearchParams } from "@/types";
import { getConversationByIdAction, getMessagesAction, getMyConversationsAction } from "../../_actions/chatActions";
import { CatalogError } from "../Catalog/CatalogStates";
import { ChatThread } from "./ChatThread";
import { ConversationList, TInboxFilter } from "./ConversationList";

const getValue = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

const toFilter = (params: TSearchParams): TInboxFilter => {
  const side = getValue(params.side);

  return {
    side: side === "buying" || side === "selling" ? side : undefined,
    archived: getValue(params.archived) === "true",
    unread: getValue(params.unread) === "true",
    searchTerm: getValue(params.searchTerm) || undefined,
  };
};

const toQueryString = (params: TSearchParams) => {
  const query = new URLSearchParams();
  for (const key of ["side", "archived", "unread", "searchTerm", "page"]) {
    const value = getValue(params[key]);
    if (value) query.set(key, value);
  }
  return query.toString();
};

// ============================================
// Loading states
// ============================================

export const ConversationListSkeleton = () => (
  <ul className="divide-y" aria-hidden="true">
    {Array.from({ length: 7 }).map((_, index) => (
      <li key={index} className="flex gap-3 px-4 py-3">
        <Skeleton className="size-11 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-5/6" />
        </div>
      </li>
    ))}
  </ul>
);

export const ChatThreadSkeleton = () => (
  <div className="flex h-full min-h-0 flex-1 flex-col" aria-hidden="true">
    <div className="flex items-center gap-3 border-b px-4 py-3">
      <Skeleton className="size-10 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
    <div className="flex-1 space-y-4 p-5">
      {[48, 64, 36, 56, 40].map((width, index) => (
        <div key={width} className={cn("flex", index % 2 ? "justify-end" : "justify-start")}>
          <Skeleton className="h-10 rounded-2xl" style={{ width: `${width}%` }} />
        </div>
      ))}
    </div>
    <div className="border-t p-3">
      <Skeleton className="h-10 w-full rounded-2xl" />
    </div>
  </div>
);

// ============================================
// Columns
// ============================================

const InboxTabs = ({
  dashboardPath,
  filter,
  canSell,
}: {
  dashboardPath: string;
  filter: TInboxFilter;
  canSell: boolean;
}) => {
  const base = `${dashboardPath}/messages`;
  const tabs = [
    { label: canSell ? "All" : "Inbox", href: base, active: !filter.side && !filter.archived },
    ...(canSell
      ? [
          { label: "Buying", href: `${base}?side=buying`, active: filter.side === "buying" && !filter.archived },
          { label: "Selling", href: `${base}?side=selling`, active: filter.side === "selling" && !filter.archived },
        ]
      : []),
    { label: "Archived", href: `${base}?archived=true`, active: filter.archived },
  ];

  return (
    <nav className="flex gap-1 overflow-x-auto" aria-label="Conversation filters">
      {tabs.map((tab) => (
        <Link
          key={tab.label}
          href={tab.href}
          aria-current={tab.active ? "page" : undefined}
          className={cn(
            "shrink-0 rounded-full px-3 py-1 text-xs font-medium transition",
            tab.active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted",
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
};

const InboxColumn = async ({
  params,
  dashboardPath,
  activeId,
}: {
  params: TSearchParams;
  dashboardPath: string;
  activeId?: string;
}) => {
  const filter = toFilter(params);
  const result = await getMyConversationsAction({
    query: {
      ...params,
      side: filter.side,
      archived: filter.archived ? "true" : undefined,
      unread: filter.unread ? "true" : undefined,
    },
  });

  if (!result.success) {
    return (
      <div className="p-4">
        <CatalogError title="Failed to load conversations" message={result.message} />
      </div>
    );
  }

  const totalPages = Math.max(1, Number(result.meta?.totalPages ?? 1));

  return (
    <>
      <ConversationList
        initialConversations={result.data ?? []}
        activeId={activeId}
        dashboardPath={dashboardPath}
        filter={filter}
        queryString={toQueryString(params)}
      />
      {totalPages > 1 && (
        <div className="border-t p-2">
          <CustomPagination currentPage={Math.max(1, Number(result.meta?.page ?? 1))} totalPages={totalPages} />
        </div>
      )}
    </>
  );
};

const ThreadColumn = async ({
  conversationId,
  meId,
  dashboardPath,
}: {
  conversationId: string;
  meId: string;
  dashboardPath: string;
}) => {
  const [detail, messages] = await Promise.all([
    getConversationByIdAction(conversationId),
    getMessagesAction(conversationId),
  ]);

  if (!detail.success || !detail.data) {
    if (detail.statusCode === 404 || detail.statusCode === 400) notFound();
    return (
      <div className="p-6">
        <CatalogError title="Failed to load this conversation" message={detail.message} />
      </div>
    );
  }

  return (
    <ChatThread
      key={conversationId}
      conversation={detail.data}
      initialMessages={messages.success ? (messages.data ?? []) : []}
      initialCursor={messages.cursor ?? null}
      meId={meId}
      dashboardPath={dashboardPath}
    />
  );
};

const NoThreadSelected = () => (
  <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
    <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
      <MessageCircle className="size-7 text-primary" aria-hidden="true" />
    </div>
    <h2 className="mt-4 text-lg font-semibold">Your messages</h2>
    <p className="mt-1 max-w-sm text-sm text-muted-foreground">Pick a conversation to read and reply.</p>
    <p className="mt-6 flex max-w-sm items-start gap-2 rounded-lg bg-muted/60 p-3 text-left text-xs text-muted-foreground">
      <ShieldCheck className="size-4 shrink-0 text-success" aria-hidden="true" />
      Stay safe: meet in a public place, check the papers before paying, and never share OTP codes.
    </p>
  </div>
);

// ============================================
// Page (list + thread, two panes on desktop)
// ============================================

export const MessagesPage = async ({
  searchParams,
  conversationId,
}: {
  searchParams?: Promise<TSearchParams>;
  conversationId?: string;
}) => {
  const [params, me] = await Promise.all([searchParams, getMe()]);
  const user = me.data;

  if (!user) notFound();

  const dashboardPath = getDashboardPath(user.role) ?? "";
  const safeParams = params ?? {};
  const filter = toFilter(safeParams);
  const canSell = user.role !== "BUYER";

  return (
    <div className="flex h-full min-h-[28rem]">
      <aside
        className={cn(
          "min-h-0 w-full flex-col border-r md:w-[22rem] md:shrink-0",
          conversationId ? "hidden md:flex" : "flex",
        )}
      >
        <div className="space-y-3 border-b p-4">
          <h1 className="text-lg font-semibold">Messages</h1>
          <InboxTabs dashboardPath={dashboardPath} filter={filter} canSell={canSell} />
          <SearchBar compact />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <Suspense key={JSON.stringify(safeParams)} fallback={<ConversationListSkeleton />}>
            <InboxColumn params={safeParams} dashboardPath={dashboardPath} activeId={conversationId} />
          </Suspense>
        </div>
      </aside>

      <section className={cn("min-h-0 min-w-0 flex-1", conversationId ? "flex" : "hidden md:flex")}>
        {conversationId ? (
          <Suspense key={conversationId} fallback={<ChatThreadSkeleton />}>
            <ThreadColumn conversationId={conversationId} meId={user.id} dashboardPath={dashboardPath} />
          </Suspense>
        ) : (
          <NoThreadSelected />
        )}
      </section>
    </div>
  );
};
