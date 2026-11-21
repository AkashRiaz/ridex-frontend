"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, MailX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { unsubscribeEmailAction } from "@/app/(dashboardGroup)/_actions/notificationActions";
import { NOTIFICATION_CATEGORY_LABEL } from "@/lib/enum";
import { TNotificationCategory } from "@/types";

/*
 * Needs a click on purpose: mail scanners open links in emails,
 * so visiting the page alone never unsubscribes anyone.
 */
export function UnsubscribeConfirm({ token }: { token: string }) {
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState<TNotificationCategory | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (done) {
    return (
      <div className="text-center">
        <CheckCircle2 className="mx-auto size-10 text-success" aria-hidden="true" />
        <h1 className="mt-3 text-xl font-semibold">You&apos;re unsubscribed</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          We won&apos;t email you about {NOTIFICATION_CATEGORY_LABEL[done].toLowerCase()} anymore. You still see these
          updates in the app.
        </p>
        <Link href="/login" className="mt-5 inline-flex text-sm font-medium text-primary hover:underline">
          Manage all notification settings
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center">
      <MailX className="mx-auto size-10 text-muted-foreground" aria-hidden="true" />
      <h1 className="mt-3 text-xl font-semibold">Unsubscribe from these emails?</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        You will stop getting this kind of email. Important account emails are always sent.
      </p>
      {error && (
        <p className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <Button
        className="mt-5"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const result = await unsubscribeEmailAction(token);
            if (result.success && result.data) setDone(result.data.category);
            else setError(result.message);
          })
        }
      >
        {isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        Unsubscribe
      </Button>
    </div>
  );
}
