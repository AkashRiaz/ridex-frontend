import { IFinancePartnerCard } from "./finance-partner.type";
import { TListingStatus } from "./listing.type";

// Keep in sync with ridex-backend/src/app/module/loanLead
export type TLoanLeadStatus =
  | "NEW"
  | "SENT_TO_PARTNER"
  | "CONTACTED"
  | "APPROVED"
  | "DISBURSED"
  | "REJECTED"
  | "WITHDRAWN"
  | "CLOSED";

export type TEmploymentType = "SALARIED" | "SELF_EMPLOYED" | "BUSINESS" | "STUDENT" | "OTHER";

export type ILoanLead = {
  id: string;
  // short code for buyers, admins and partners: "LL-3F9A2C1B"
  reference: string;
  status: TLoanLeadStatus;
  listingId: string;
  buyerId: string;
  listingPrice: number;
  downPayment: number;
  loanAmount: number;
  tenureMonths: number;
  interestRate: number;
  estimatedEmi: number;
  totalPayable: number;
  totalInterest: number;
  fullName: string;
  phone: string;
  email: string | null;
  district: string | null;
  monthlyIncome: number | null;
  employmentType: TEmploymentType;
  note: string;
  consentAt: string;
  partnerReference: string | null;
  // shown to the buyer for REJECTED / WITHDRAWN / CLOSED
  closeReason: string | null;
  sentAt: string | null;
  contactedAt: string | null;
  approvedAt: string | null;
  disbursedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  canWithdraw: boolean;
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
  preferredPartner: IFinancePartnerCard | null;
  partner: IFinancePartnerCard | null;
};

// admin view adds the internal fields
export type ILoanLeadAdmin = ILoanLead & {
  adminNote: string | null;
  buyer: { id: string; name: string; email: string | null; phone: string | null; imageUrl: string | null };
  partnerContact: { contactEmail: string; contactPhone: string | null } | null;
};

export type TLoanLeadStatusCounts = Partial<Record<TLoanLeadStatus, number>>;
