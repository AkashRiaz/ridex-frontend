import { IBrand, IListingDetail, IVehicleType } from "@/types";

export const WIZARD_STEPS = [
  { id: 1, label: "Vehicle" },
  { id: 2, label: "Specs" },
  { id: 3, label: "Price & details" },
  { id: 4, label: "Photos" },
  { id: 5, label: "Review" },
] as const;

export type TWizardStep = (typeof WIZARD_STEPS)[number]["id"];

export type TWizardContext = {
  listing: IListingDetail | null;
  vehicleTypes: IVehicleType[];
  brands: IBrand[];
  dashboardPath: string;
  // the step component reports the saved listing back to the wizard
  onSaved: (listing: IListingDetail) => void;
  goToStep: (step: TWizardStep) => void;
};
