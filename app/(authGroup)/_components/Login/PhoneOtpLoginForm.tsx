"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useForm } from "@tanstack/react-form";
import { ArrowLeft, Loader2, MessageSquareText, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FieldErrorText } from "@/components/ui/FieldErrorText";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneOtpRequestZodSchema } from "@/components/validations/auth.validation";
import z from "zod";
import {
  sendPhoneOtpAction,
  verifyPhoneOtpAction,
} from "../../_actions/authActions";
import OtpInput from "../shared/OtpInput";
import ResendCodeButton from "../shared/ResendCodeButton";

const OtpStepZodSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
});

/*
 * Two steps: phone → code. Only for accounts with a verified phone.
 */
const PhoneOtpLoginForm = ({ redirectTo }: { redirectTo?: string }) => {
  const [phone, setPhone] = useState<string | null>(null);
  const [isSending, startSending] = useTransition();

  const [state, formAction] = useActionState(verifyPhoneOtpAction, null);
  const [isVerifying, startVerifying] = useTransition();

  useEffect(() => {
    if (state && !state.success) {
      toast.error(state.message || "Verification failed");
    }
  }, [state]);

  const phoneForm = useForm({
    defaultValues: { phone: "" },
    validators: { onSubmit: PhoneOtpRequestZodSchema },
    onSubmit: async ({ value }) => {
      startSending(async () => {
        const result = await sendPhoneOtpAction(value.phone, "LOGIN");

        if (result.success) {
          toast.success(result.message);
          setPhone(value.phone);
        } else {
          toast.error(result.message);
        }
      });
    },
  });

  const otpForm = useForm({
    defaultValues: { otp: "" },
    validators: { onSubmit: OtpStepZodSchema },
    onSubmit: async ({ value }) => {
      const formData = new FormData();
      formData.append("phone", phone ?? "");
      formData.append("otp", value.otp);
      formData.append("purpose", "LOGIN");
      formData.append("redirectTo", redirectTo ?? "");

      startVerifying(() => {
        formAction(formData);
      });
    },
  });

  if (!phone) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          phoneForm.handleSubmit();
        }}
        className="space-y-5"
        noValidate
      >
        <phoneForm.Field name="phone">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <div className="space-y-2">
                <Label htmlFor="login-phone">Phone number</Label>
                <Input
                  id="login-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="01XXXXXXXXX"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  aria-invalid={isInvalid}
                />
                <FieldErrorText show={isInvalid} errors={field.state.meta.errors} />
                <p className="text-xs text-muted-foreground">
                  We&apos;ll text you a 6-digit code. Your phone must already be verified.
                </p>
              </div>
            );
          }}
        </phoneForm.Field>

        <Button type="submit" className="h-10 w-full" disabled={isSending}>
          {isSending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Sending code...
            </>
          ) : (
            <>
              <MessageSquareText className="mr-2 size-4" />
              Send code
            </>
          )}
        </Button>
      </form>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        otpForm.handleSubmit();
      }}
      className="space-y-5"
      noValidate
    >
      <p className="text-center text-sm text-muted-foreground">
        Enter the code sent to <span className="font-medium text-foreground">{phone}</span>
      </p>

      <otpForm.Field name="otp">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;

          return (
            <div className="space-y-2">
              <OtpInput
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                invalid={isInvalid}
                autoFocus
              />
              <div className="text-center">
                <FieldErrorText show={isInvalid} errors={field.state.meta.errors} />
              </div>
            </div>
          );
        }}
      </otpForm.Field>

      <Button type="submit" className="h-10 w-full" disabled={isVerifying}>
        {isVerifying ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Verifying...
          </>
        ) : (
          <>
            <ShieldCheck className="mr-2 size-4" />
            Verify &amp; sign in
          </>
        )}
      </Button>

      <ResendCodeButton onResend={() => sendPhoneOtpAction(phone, "LOGIN")} />

      <button
        type="button"
        onClick={() => {
          setPhone(null);
          otpForm.reset();
        }}
        className="mx-auto flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Use a different number
      </button>
    </form>
  );
};

export default PhoneOtpLoginForm;
