import { Suspense } from "react";
import Link from "next/link";
import { Settings } from "lucide-react";
import { CustomPagination } from "@/components/ui/CustomPagination";
import { Skeleton } from "@/components/ui/skeleton";
import { UrlFilterSelect } from "@/components/shared/UrlFilterSelect";
import { getDashboardPath } from "@/lib/dashboardPath";
import { NOTIFICATION_CATEGORY_LABEL } from "@/lib/enum";
import { cn } from "@/lib/utils";
import { getMe } from "@/service/getMe";
import { TNotificationCategory, TSearchParams } from "@/types";
import { getMyNotificationsAction, getNotificationPreferencesAction } from "../../_actions/notificationActions";
import { CatalogError } from "../Catalog/CatalogStates";
import { NotificationList } from "./NotificationList";
import { NotificationPreferencesForm } from "./NotificationPreferencesForm";

const getValue = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

const ListSkeleton = () => (
  <ul className="divide-y rounded-xl border" aria-hidden="true">
    {[1, 2, 3, 4, 5].map((row) => (
      <li key={row} className="flex gap-3 p-4">
        <Skeleton className="size-9 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-1/2" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </li>
    ))}
  </ul>
);

// ============================================
// List
// ============================================

const NotificationResults = async ({ params }: { params: TSearchParams }) => {
  const result = await getMyNotificationsAction({ query: params });

  if (!result.success) {
    return <CatalogError title="Failed to load notifications" message={result.message} />;
  }

  const page = Math.max(1, Number(result.meta?.page ?? 1));

  return (
    <div className="space-y-4">
      <NotificationList
        initialNotifications={result.data ?? []}
        isFirstPage={page === 1}
        unreadOnly={getValue(params.status) === "unread"}
      />
      <CustomPagination currentPage={page} totalPages={Math.max(1, Number(result.meta?.totalPages ?? 1))} />
    </div>
  );
};

export const NotificationsPage = async ({ searchParams }: { searchParams?: Promise<TSearchParams> }) => {
  const [params, me] = await Promise.all([searchParams, getMe()]);
  const dashboardPath = getDashboardPath(me.data?.role) ?? "";
  const safeParams = params ?? {};
  const unreadOnly = getValue(safeParams.status) === "unread";
  const base = `${dashboardPath}/notifications`;

  return (
    <div className="mx-auto max-w-3xl space-y-5 p-2 md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Notifications</h1>
          <p className="text-sm text-muted-foreground">Updates about your listings, reviews and account</p>
        </div>
        <Link
          href={`${base}/settings`}
          className="inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium transition hover:bg-muted"
        >
          <Settings className="size-4" aria-hidden="true" /> Settings
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav className="flex gap-1" aria-label="Notification filters">
          {[
            { label: "All", href: base, active: !unreadOnly },
            { label: "Unread", href: `${base}?status=unread`, active: unreadOnly },
          ].map((tab) => (
            <Link
              key={tab.label}
              href={tab.href}
              aria-current={tab.active ? "page" : undefined}
              className={cn(
                "rounded-full px-3 py-1 text-sm font-medium transition",
                tab.active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted",
              )}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
        <UrlFilterSelect
          param="category"
          label="Category"
          allLabel="All categories"
          options={(Object.keys(NOTIFICATION_CATEGORY_LABEL) as TNotificationCategory[]).map((category) => ({
            value: category,
            label: NOTIFICATION_CATEGORY_LABEL[category],
          }))}
          className="w-48"
        />
      </div>

      <Suspense key={JSON.stringify(safeParams)} fallback={<ListSkeleton />}>
        <NotificationResults params={safeParams} />
      </Suspense>
    </div>
  );
};

// ============================================
// Settings
// ============================================

const PreferencesSection = async () => {
  const result = await getNotificationPreferencesAction();

  if (!result.success || !result.data) {
    return <CatalogError title="Failed to load your notification settings" message={result.message} />;
  }

  return <NotificationPreferencesForm initial={result.data} />;
};

export const NotificationSettingsPage = async () => {
  const me = await getMe();
  const dashboardPath = getDashboardPath(me.data?.role) ?? "";

  return (
    <div className="mx-auto max-w-3xl space-y-5 p-2 md:p-5">
      <div>
        <Link href={`${dashboardPath}/notifications`} className="text-sm text-primary hover:underline">
          ← Notifications
        </Link>
        <h1 className="mt-1 text-xl font-semibold">Notification settings</h1>
        <p className="text-sm text-muted-foreground">
          Choose what reaches you in the app and by email
          {me.data?.email ? ` (${me.data.email})` : ""}. Changes save automatically.
        </p>
        {me.data && !me.data.emailVerified && (
          <p className="mt-2 rounded-lg bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
            Verify your email address to receive email notifications.
          </p>
        )}
      </div>
      <Suspense fallback={<ListSkeleton />}>
        <PreferencesSection />
      </Suspense>
    </div>
  );
};
