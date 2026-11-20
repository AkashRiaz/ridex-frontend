"use client";

import { useEffect, useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

type ResendCodeButtonProps = {
  onResend: () => Promise<{ success: boolean; message: string }>;
  // the backend cooldown (OTP_RESEND_COOLDOWN_SECONDS)
  cooldownSeconds?: number;
  // a code was just sent before this component mounted
  startOnMount?: boolean;
};

const ResendCodeButton = ({
  onResend,
  cooldownSeconds = 60,
  startOnMount = true,
}: ResendCodeButtonProps) => {
  const [secondsLeft, setSecondsLeft] = useState(
    startOnMount ? cooldownSeconds : 0,
  );
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timer = setTimeout(() => setSecondsLeft((seconds) => seconds - 1), 1000);

    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const handleResend = () => {
    startTransition(async () => {
      const result = await onResend();

      if (result.success) {
        toast.success(result.message);
        setSecondsLeft(cooldownSeconds);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <p className="text-center text-sm text-muted-foreground">
      Didn&apos;t get the code?{" "}
      <button
        type="button"
        onClick={handleResend}
        disabled={secondsLeft > 0 || isPending}
        className="inline-flex items-center gap-1 font-medium text-primary transition hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline"
        aria-live="polite"
      >
        {isPending && <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />}
        {secondsLeft > 0 ? `Resend in ${secondsLeft}s` : "Resend code"}
      </button>
    </p>
  );
};

export default ResendCodeButton;
