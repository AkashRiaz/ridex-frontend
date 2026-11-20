import { Suspense } from "react";
import { Star } from "lucide-react";
import { CustomPagination } from "@/components/ui/CustomPagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TSearchParams } from "@/types";
import { getGivenReviewsAction, getReceivedReviewsAction } from "../../_actions/reviewActions";
import { CatalogError } from "../Catalog/CatalogStates";
import { GivenReviewItem, ReceivedReviewItem } from "./ReviewItemActions";

const getValue = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

type TReviewTab = "received" | "awaiting" | "given";

const ReviewList = async ({ tab, searchParams }: { tab: TReviewTab; searchParams?: TSearchParams }) => {
  const page = getValue(searchParams?.page);
  const result =
    tab === "given"
      ? await getGivenReviewsAction({ page })
      : await getReceivedReviewsAction({ page, ...(tab === "awaiting" && { replied: "false" }) });

  if (!result.success) {
    return <CatalogError title="Failed to load reviews" message={result.message} />;
  }

  const reviews = result.data ?? [];

  if (reviews.length === 0) {
    const text = {
      received: "When buyers rate you, their reviews appear here.",
      awaiting: "You have replied to every review. 🎉",
      given: "Reviews you write for sellers appear here. You can rate a seller from their listing page.",
    }[tab];

    return (
      <div className="rounded-2xl border border-dashed p-12 text-center">
        <Star className="mx-auto size-8 text-muted-foreground" aria-hidden="true" />
        <p className="mt-3 text-sm text-muted-foreground">{text}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ul className="space-y-3">
        {reviews.map((review) => (
          <li key={review.id}>
            {tab === "given" ? <GivenReviewItem review={review} /> : <ReceivedReviewItem review={review} />}
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

/*
 * Sellers and dealers see received + given; buyers only see given.
 */
export const MyReviewsPage = async ({
  searchParams,
  dashboardPath,
  canReceive,
}: {
  searchParams?: Promise<TSearchParams>;
  dashboardPath: string;
  canReceive: boolean;
}) => {
  const params = await searchParams;
  const requested = getValue(params?.tab) as TReviewTab | undefined;
  const tab: TReviewTab = canReceive ? (requested ?? "received") : "given";
  const basePath = `${dashboardPath}/reviews`;

  return (
    <div className="space-y-5 p-2 md:p-5">
      <div>
        <h1 className="text-xl font-semibold">Reviews</h1>
        <p className="text-sm text-muted-foreground">
          {canReceive ? "What buyers say about you, and reviews you wrote" : "Reviews you wrote for sellers"}
        </p>
      </div>

      {canReceive && (
        <Tabs>
          <TabsList className="h-auto flex-wrap">
            <TabsTrigger href={basePath} active={tab === "received"} replace scroll={false}>
              Received
            </TabsTrigger>
            <TabsTrigger href={`${basePath}?tab=awaiting`} active={tab === "awaiting"} replace scroll={false}>
              Awaiting reply
            </TabsTrigger>
            <TabsTrigger href={`${basePath}?tab=given`} active={tab === "given"} replace scroll={false}>
              Given
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      <Suspense key={JSON.stringify(params ?? {})} fallback={<Skeleton className="h-64 w-full rounded-2xl" />}>
        <ReviewList tab={tab} searchParams={params} />
      </Suspense>
    </div>
  );
};
