import { TListingStatus } from "./listing.type";

// Keep in sync with ridex-backend/src/app/module/offer

export type TOfferStatus = "PENDING" | "COUNTERED" | "ACCEPTED" | "DECLINED" | "WITHDRAWN" | "EXPIRED" | "CANCELLED";

export type TOfferAction = "counter" | "accept" | "decline" | "withdraw";

export type TOfferSide = "buyer" | "seller";

type TOfferPerson = { id: string; name: string; imageUrl: string | null };

// live state carried by an OFFER card in chat (message.offer)
export type IOfferCard = {
  id: string;
  amount: number;
  status: TOfferStatus;
  proposedById: string;
  round: number;
  parentOfferId: string | null;
  expiresAt: string;
  respondedAt: string | null;
};

export type IOffer = IOfferCard & {
  listingId: string;
  conversationId: string;
  buyerId: string;
  sellerId: string;
  message: string;
  declineReason: string | null;
  createdAt: string;
  updatedAt: string;
  side: TOfferSide | null;
  isMine: boolean;
  allowedActions: TOfferAction[];
  listing: {
    id: string;
    title: string;
    slug: string;
    price: number;
    status: TListingStatus;
    isDeleted: boolean;
    coverImage: string | null;
  };
  buyer: TOfferPerson;
  seller: TOfferPerson;
};

export type IOfferDetail = IOffer & { history: IOffer[] };

// socket "offer:updated"
export type TOfferUpdatedEvent = { conversationId: string; offer: IOfferCard };
