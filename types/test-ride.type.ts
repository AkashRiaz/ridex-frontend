import { TListingStatus } from "./listing.type";

// Keep in sync with ridex-backend/src/app/module/testRide

export type TTestRideStatus = "REQUESTED" | "CONFIRMED" | "DECLINED" | "CANCELLED" | "COMPLETED" | "NO_SHOW" | "EXPIRED";

export type TTestRideAction = "confirm" | "decline" | "cancel" | "complete" | "noShow";

type TTestRidePerson = { id: string; name: string; imageUrl: string | null };

// live state carried by a TEST_RIDE card in chat (message.testRide)
export type ITestRideCard = {
  id: string;
  status: TTestRideStatus;
  startsAt: string;
  endsAt: string;
  sellerNote: string;
  confirmedAt: string | null;
};

export type ITestRide = ITestRideCard & {
  listingId: string;
  conversationId: string;
  buyerId: string;
  sellerId: string;
  buyerNote: string;
  declineReason: string | null;
  cancelReason: string | null;
  cancelledById: string | null;
  cancelledAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  side: "buyer" | "seller";
  allowedActions: TTestRideAction[];
  listing: {
    id: string;
    title: string;
    slug: string;
    price: number;
    status: TListingStatus;
    isDeleted: boolean;
    district: string;
    area: string | null;
    coverImage: string | null;
  };
  buyer: TTestRidePerson;
  seller: TTestRidePerson;
};

export type ITestRideSlot = {
  startsAt: string;
  endsAt: string;
  // local "HH:mm"
  time: string;
};

export type ITestRideSlotDay = {
  // local "YYYY-MM-DD"
  date: string;
  dayOfWeek: number;
  slots: ITestRideSlot[];
};

export type ITestRideSlots = {
  listingId: string;
  timezone: string;
  from: string;
  to: string;
  hasAvailability: boolean;
  days: ITestRideSlotDay[];
};

export type IAvailabilityRule = {
  id?: string;
  listingId: string | null;
  listing?: { id: string; title: string; slug: string } | null;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotMinutes: number;
  capacity: number;
};

export type IBlockedDate = {
  id: string;
  date: string;
  reason: string | null;
};

export type IMyAvailability = {
  timezone: string;
  slotMinuteOptions: number[];
  bookingDays: number;
  minLeadHours: number;
  rules: IAvailabilityRule[];
  blockedDates: IBlockedDate[];
};

// socket "testRide:updated"
export type TTestRideUpdatedEvent = { conversationId: string; testRide: ITestRideCard };
