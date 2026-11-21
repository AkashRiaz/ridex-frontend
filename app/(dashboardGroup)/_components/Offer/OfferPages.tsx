import { Suspense } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TSearchParams } from "@/types";
import OfferLoadingTable from "./OfferLoadingTable";
import OfferTable from "./OfferTable";

const getValue = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

/*
 * Offers I made (buying) and, for roles that sell, offers on my listings.
 */
export const MyOffersPage = async ({
  searchParams,
  dashboardPath,
  canSell,
}: {
  searchParams?: Promise<TSearchParams>;
  dashboardPath: string;
  canSell: boolean;
}) => {
  const params = (await searchParams) ?? {};
  const as = canSell && getValue(params.as) !== "buyer" ? "seller" : "buyer";
  const basePath = `${dashboardPath}/offers`;

  return (
    <div className="space-y-4 p-2 md:p-5">
      <div>
        <h1 className="text-xl font-semibold">Offers</h1>
        <p className="text-sm text-muted-foreground">
          Price negotiations. Each offer also lives in its chat, where you can talk it through.
        </p>
      </div>

      {canSell && (
        <Tabs>
          <TabsList>
            <TabsTrigger href={basePath} active={as === "seller"} replace scroll={false}>
              Received
            </TabsTrigger>
            <TabsTrigger href={`${basePath}?as=buyer`} active={as === "buyer"} replace scroll={false}>
              Sent
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      <Suspense key={JSON.stringify(params)} fallback={<OfferLoadingTable />}>
        <OfferTable searchParams={params} dashboardPath={dashboardPath} as={as} />
      </Suspense>
    </div>
  );
};
