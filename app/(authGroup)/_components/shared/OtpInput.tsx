"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  length?: number;
  disabled?: boolean;
  invalid?: boolean;
  autoFocus?: boolean;
};

/*
 * 6 single-digit boxes. Supports typing, backspace, arrow keys and paste.
 */
const OtpInput = ({
  value,
  onChange,
  onBlur,
  length = 6,
  disabled = false,
  invalid = false,
  autoFocus = false,
}: OtpInputProps) => {
  const inputReferences = useRef<(HTMLInputElement | null)[]>([]);

  const digits = Array.from({ length }, (_, index) => value[index] ?? "");

  const focusInput = (index: number) => {
    inputReferences.current[Math.max(0, Math.min(index, length - 1))]?.focus();
  };

  const setDigit = (index: number, digit: string) => {
    const next = [...digits];
    next[index] = digit;
    onChange(next.join("").slice(0, length));
  };

  const handleChange = (index: number, rawValue: string) => {
    const onlyDigits = rawValue.replace(/\D/g, "");

    if (!onlyDigits) {
      setDigit(index, "");
      return;
    }

    // autofill / fast typing can deliver several digits at once
    if (onlyDigits.length > 1) {
      const next = [...digits];
      onlyDigits
        .slice(0, length - index)
        .split("")
        .forEach((digit, offset) => {
          next[index + offset] = digit;
        });
      onChange(next.join(""));
      focusInput(index + onlyDigits.length);
      return;
    }

    setDigit(index, onlyDigits);
    focusInput(index + 1);
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      event.preventDefault();
      setDigit(index - 1, "");
      focusInput(index - 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusInput(index - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      focusInput(index + 1);
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);

    if (!pasted) return;

    event.preventDefault();
    onChange(pasted);
    focusInput(pasted.length);
  };

  return (
    <div
      className="flex justify-center gap-2 sm:gap-3"
      role="group"
      aria-label="Verification code"
    >
      {digits.map((digit, index) => (
        <input
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length positional inputs
          key={index}
          ref={(element) => {
            inputReferences.current[index] = element;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          pattern="\d*"
          maxLength={length}
          value={digit}
          disabled={disabled}
          autoFocus={autoFocus && index === 0}
          aria-label={`Digit ${index + 1} of ${length}`}
          aria-invalid={invalid}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          onFocus={(event) => event.target.select()}
          onBlur={onBlur}
          className={cn(
            "size-11 rounded-lg border bg-background text-center text-lg font-semibold transition outline-none sm:size-12",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40",
            "disabled:opacity-50",
            invalid && "border-destructive ring-destructive/20",
          )}
        />
      ))}
    </div>
  );
};

export default OtpInput;
