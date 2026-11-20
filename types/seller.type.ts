import { Role } from "./common.type";
import { IListingCard } from "./listing.type";

export type ISellerBadges = {
  phoneVerified: boolean;
  idVerified: boolean;
  dealerVerified: boolean;
};

export type ISellerSummary = {
  id: string;
  name: string;
  imageUrl: string | null;
  role: Role;
  ratingAverage: number;
  ratingCount: number;
  badges: ISellerBadges;
};

export type IPublicSellerProfile = ISellerSummary & {
  bio: string | null;
  division: string | null;
  district: string | null;
  memberSince: string;
  emailVerified: boolean;
  stats: { activeListings: number; soldListings: number };
  listings: IListingCard[];
};
