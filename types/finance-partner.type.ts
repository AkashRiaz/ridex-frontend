// Keep in sync with ridex-backend/src/app/module/financePartner

// what anyone sees (EMI calculator presets)
export type IFinancePartnerCard = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  interestRateMin: number;
  interestRateMax: number;
  minDownPaymentPercent: number;
  maxTenureMonths: number;
};

export type IActiveFinancePartners = {
  partners: IFinancePartnerCard[];
  defaults: { interestRate: number; minDownPaymentPercent: number };
};

// admin view
export type IFinancePartner = IFinancePartnerCard & {
  description: string | null;
  contactEmail: string;
  contactPhone: string | null;
  website: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  openLeadsCount: number;
  _count?: { loanLeads: number };
};
