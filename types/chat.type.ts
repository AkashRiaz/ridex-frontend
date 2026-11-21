import { Role } from "./common.type";
import { TListingStatus } from "./listing.type";
import { IOfferCard } from "./offer.type";
import { ITestRideCard } from "./test-ride.type";

// Keep in sync with ridex-backend/src/app/module/chat

export type TMessageType = "TEXT" | "IMAGE" | "SYSTEM" | "OFFER" | "TEST_RIDE";

export type TConversationSide = "buyer" | "seller";

export type TReadOnlyCode = "BLOCKED_BY_ME" | "BLOCKED_ME" | "COUNTERPART_UNAVAILABLE" | "LISTING_REMOVED";

export type IChatParticipant = {
  id: string;
  name: string;
  imageUrl: string | null;
  role: Role;
  ratingAverage: number;
  ratingCount: number;
  badges: { phoneVerified: boolean; idVerified: boolean; dealerVerified: boolean };
  isDeleted: boolean;
  isOnline: boolean;
};

export type IConversation = {
  id: string;
  side: TConversationSide;
  listing: {
    id: string;
    title: string;
    slug: string;
    price: number;
    status: TListingStatus;
    isNegotiable: boolean;
    isDeleted: boolean;
    coverImage: string | null;
  };
  counterpart: IChatParticipant;
  lastMessageAt: string;
  lastMessagePreview: string;
  lastMessageFromMe: boolean;
  unreadCount: number;
  isArchived: boolean;
  myLastReadAt: string | null;
  counterpartLastReadAt: string | null;
  createdAt: string;
};

export type IConversationDetail = IConversation & {
  block: { blockedByMe: boolean; blockedMe: boolean };
  canReply: boolean;
  readOnlyCode: TReadOnlyCode | null;
  readOnlyReason: string | null;
  listingNotice: string | null;
};

export type IMessage = {
  id: string;
  conversationId: string;
  senderId: string | null;
  type: TMessageType;
  body: string;
  imageUrl: string | null;
  quickReplyKey: string | null;
  clientId: string | null;
  // OFFER / TEST_RIDE cards and the SYSTEM notices about them carry the live state
  offerId?: string | null;
  offer?: IOfferCard | null;
  testRideId?: string | null;
  testRide?: ITestRideCard | null;
  createdAt: string;
};

// optimistic copy shown before the server confirms it
export type IChatMessage = IMessage & {
  pending?: boolean;
  failed?: boolean;
  // local preview for a photo still uploading
  localImageUrl?: string;
};

export type TCursorMeta = {
  limit: number;
  hasMore: boolean;
  nextCursor: string | null;
};

export type IChatUnread = {
  total: number;
  conversations: number;
};

export type IQuickReplies = {
  builtIn: Record<TConversationSide, { key: string; text: string }[]>;
  custom: { id: string; text: string; sortOrder: number }[];
};

export type IBlockedUser = {
  id: string;
  createdAt: string;
  user: { id: string; name: string; imageUrl: string | null; role: Role; isDeleted: boolean };
};

// ============================================
// Socket payloads (server → client)
// ============================================

export type TMessageNewEvent = { conversation: IConversation; message: IMessage };

export type TConversationReadEvent = { conversationId: string; readerId: string; readAt: string };

export type TTypingEvent = { conversationId: string; userId: string; isTyping: boolean };

export type TBlockChangedEvent = { userId: string; blockedByMe?: boolean; blockedMe?: boolean };

export type TSocketAck<T> = { success: boolean; statusCode?: number; message?: string; data?: T };
