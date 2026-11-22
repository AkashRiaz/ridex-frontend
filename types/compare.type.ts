import { IListingCard } from "./listing.type";
import { IPriceInsight } from "./price-insight.type";
import { TAttributeType } from "./vehicle-type.type";

// Keep in sync with ridex-backend/src/app/module/compare
export type ICompareListing = IListingCard & {
  description: string;
  color: string | null;
  priceInsight: IPriceInsight;
};

export type ICompareSpecRow = {
  key: string;
  label: string;
  group: string;
  type: TAttributeType;
  unit: string | null;
  // one value per listing, in column order
  values: (string | null)[];
  isDifferent: boolean;
};

export type ICompareHighlights = {
  lowestPrice: string[];
  lowestMileage: string[];
  newestYear: string[];
  bestDeal: string[];
};

export type ICompareResult = {
  vehicleType: { id: string; name: string; slug: string } | null;
  listings: ICompareListing[];
  specRows: ICompareSpecRow[];
  highlights: ICompareHighlights;
  // ids that are no longer public (sold out of the window, deleted, expired)
  missingIds: string[];
};
