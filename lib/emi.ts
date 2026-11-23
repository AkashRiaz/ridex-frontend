/*
 * EMI maths for the listing page calculator. Same formula and limits as
 * ridex-backend loanLead.utils.ts (the server recomputes every request).
 */

export const LOAN_TENURE_MIN_MONTHS = 6;

export const LOAN_TENURE_MAX_MONTHS = 60;

export const LOAN_RATE_MAX_PERCENT = 40;

export const LOAN_NOTE_MAX = 500;

export const TENURE_OPTIONS = [6, 12, 18, 24, 36, 48];

const roundMoney = (value: number) => Math.round(value * 100) / 100;

/*
 * Reducing-balance EMI: P × r × (1 + r)^n / ((1 + r)^n − 1),
 * r = yearly rate / 12 / 100. A 0% rate splits the principal evenly.
 */
export const calculateEmi = (principal: number, yearlyRatePercent: number, months: number) => {
  if (principal <= 0 || months <= 0) return 0;

  const monthlyRate = yearlyRatePercent / 12 / 100;

  if (monthlyRate === 0) return roundMoney(principal / months);

  const growth = (1 + monthlyRate) ** months;

  return roundMoney((principal * monthlyRate * growth) / (growth - 1));
};

export const buildLoanTerms = (input: {
  listingPrice: number;
  downPayment: number;
  tenureMonths: number;
  interestRate: number;
}) => {
  const loanAmount = roundMoney(Math.max(0, input.listingPrice - input.downPayment));
  const estimatedEmi = calculateEmi(loanAmount, input.interestRate, input.tenureMonths);
  const totalPayable = roundMoney(estimatedEmi * input.tenureMonths);

  return {
    loanAmount,
    estimatedEmi,
    totalPayable,
    totalInterest: roundMoney(Math.max(0, totalPayable - loanAmount)),
  };
};

// smallest down payment for a price, in money (platform minimum or the partner's, whichever is higher)
export const minDownPaymentFor = (price: number, percents: number[]) =>
  Math.ceil((price * Math.max(0, ...percents)) / 100);

export const formatRate = (rate: number) => `${Number(rate.toFixed(2))}%`;
