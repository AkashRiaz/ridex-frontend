import { IUser } from "./user.type";

export type TAuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type TAuthResponseData = TAuthTokens & {
  user: IUser;
};

export type TRegisterResponseData = {
  user: IUser;
  verification: {
    email: boolean;
    phone: boolean;
  };
};

export type TPhoneOtpPurpose = "VERIFY" | "LOGIN";
