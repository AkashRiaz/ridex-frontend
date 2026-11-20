"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import OtpInput from "@/app/(authGroup)/_components/shared/OtpInput";
import ResendCodeButton from "@/app/(authGroup)/_components/shared/ResendCodeButton";
import {
  sendMyPhoneOtpAction,
  verifyMyPhoneAction,
} from "../../_actions/profileActions";

/*
 * Inline phone verification for logged-in users
 * (the /verify-phone page is for signed-out users).
 */
const PhoneVerification = ({ phone }: { phone: string }) => {
  const router = useRouter();
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [isPending, startTransition] = useTransition();

  const sendCode = () => {
    startTransition(async () => {
      const result = await sendMyPhoneOtpAction(phone);

      if (result.success) {
        toast.success(result.message);
        setIsCodeSent(true);
      } else {
        toast.error(result.message);
      }
    });
  };

  const verifyCode = () => {
    startTransition(async () => {
      const result = await verifyMyPhoneAction(phone, otp);

      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  };

  if (!isCodeSent) {
    return (
      <Button type="button" variant="outline" size="sm" onClick={sendCode} disabled={isPending}>
        {isPending ? <Loader2 className="animate-spin" /> : <Smartphone />}
        Verify phone
      </Button>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border bg-muted/30 p-4">
      <p className="text-sm text-muted-foreground">
        Enter the code sent to <span className="font-medium text-foreground">{phone}</span>
      </p>
      <OtpInput value={otp} onChange={setOtp} disabled={isPending} autoFocus />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ResendCodeButton onResend={() => sendMyPhoneOtpAction(phone)} />
        <Button
          type="button"
          size="sm"
          onClick={verifyCode}
          disabled={isPending || otp.length !== 6}
        >
          {isPending ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
          Confirm
        </Button>
      </div>
    </div>
  );
};

export default PhoneVerification;
