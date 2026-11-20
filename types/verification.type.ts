import { Role, UserStatus } from "./common.type";

export type TVerificationType = "ID" | "DEALER";

export type TVerificationStatus = "PENDING" | "APPROVED" | "REJECTED";

export type TDocumentKind =
  | "NID_FRONT"
  | "NID_BACK"
  | "SELFIE"
  | "TRADE_LICENSE"
  | "TIN_CERTIFICATE"
  | "SHOWROOM_PHOTO";

export type IVerificationIdDetails = { fullName: string; nidLast4: string };

export type IVerificationDealerDetails = {
  businessName: string;
  tradeLicenseNumber: string;
  division: string;
  district: string;
  area: string | null;
};

export type IVerificationRequest = {
  id: string;
  type: TVerificationType;
  status: TVerificationStatus;
  details: Partial<IVerificationIdDetails & IVerificationDealerDetails>;
  rejectionReason: string | null;
  reviewedAt: string | null;
  documentsPurgedAt: string | null;
  createdAt: string;
  documents: { id: string; kind: TDocumentKind; format: string; bytes: number }[];
  // admin queue only
  user?: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    role: Role;
    status: UserStatus;
    imageUrl: string | null;
  };
};

export type IVerificationRequestDetail = Omit<IVerificationRequest, "documents" | "user"> & {
  user: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    phoneVerified: boolean;
    role: Role;
    status: UserStatus;
    imageUrl: string | null;
    createdAt: string;
    idVerifiedAt: string | null;
    dealerVerifiedAt: string | null;
  };
  documents: {
    id: string;
    kind: TDocumentKind;
    format: string;
    bytes: number;
    createdAt: string;
    url: string | null;
  }[];
  documentUrlsExpireAt: string | null;
};

export type IMyVerification = {
  badges: {
    phone: { verified: boolean; phone: string | null };
    email: { verified: boolean };
    id: { verified: boolean; verifiedAt: string | null; latestRequest: IVerificationRequest | null };
    dealer: {
      applicable: boolean;
      verified: boolean;
      verifiedAt: string | null;
      latestRequest: IVerificationRequest | null;
    };
  };
  accountStatus: UserStatus;
  requests: IVerificationRequest[];
};
