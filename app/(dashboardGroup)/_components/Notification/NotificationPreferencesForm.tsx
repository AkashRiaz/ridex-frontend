"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { NOTIFICATION_CATEGORY_DESCRIPTION, NOTIFICATION_CATEGORY_LABEL } from "@/lib/enum";
import { cn } from "@/lib/utils";
import { INotificationPreference } from "@/types";
import { updateNotificationPreferenceAction } from "../../_actions/notificationActions";

type TChannel = "inApp" | "email";

const Toggle = ({
  checked,
  locked,
  label,
  onChange,
}: {
  checked: boolean;
  locked: boolean;
  label: string;
  onChange: (value: boolean) => void;
}) => (
  <label className={cn("relative inline-flex items-center", locked ? "cursor-not-allowed" : "cursor-pointer")}>
    <input
      type="checkbox"
      role="switch"
      className="peer sr-only"
      checked={checked}
      disabled={locked}
      aria-label={label}
      onChange={(event) => onChange(event.target.checked)}
    />
    <span
      className={cn(
        "h-6 w-11 rounded-full bg-muted-foreground/30 transition peer-checked:bg-primary peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50",
        locked && "opacity-60",
      )}
    />
    <span className="pointer-events-none absolute left-0.5 size-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
    {locked && <Lock className="ml-2 size-3.5 text-muted-foreground" aria-hidden="true" />}
  </label>
);

/*
 * Category × channel switches. Each change is saved immediately
 * (optimistic; rolled back if the server refuses).
 */
export function NotificationPreferencesForm({ initial }: { initial: INotificationPreference[] }) {
  const [preferences, setPreferences] = useState(initial);

  const change = async (preference: INotificationPreference, channel: TChannel, value: boolean) => {
    const previous = preferences;
    setPreferences((current) =>
      current.map((item) => (item.category === preference.category ? { ...item, [channel]: value } : item)),
    );

    const result = await updateNotificationPreferenceAction({ category: preference.category, [channel]: value });

    if (result.success && result.data) {
      setPreferences(result.data);
      toast.success(result.message);
    } else {
      setPreferences(previous);
      toast.error(result.message);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="hidden grid-cols-[1fr_5rem_5rem] gap-4 border-b bg-muted/40 px-5 py-2 text-xs font-medium text-muted-foreground sm:grid">
        <span>Notify me about</span>
        <span className="text-center">In app</span>
        <span className="text-center">Email</span>
      </div>
      <ul className="divide-y">
        {preferences.map((preference) => {
          const label = NOTIFICATION_CATEGORY_LABEL[preference.category];

          return (
            <li key={preference.category} className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_5rem_5rem] sm:items-center sm:gap-4">
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{NOTIFICATION_CATEGORY_DESCRIPTION[preference.category]}</p>
              </div>
              <div className="flex items-center justify-between gap-2 sm:justify-center">
                <span className="text-xs text-muted-foreground sm:hidden">In app</span>
                <Toggle
                  checked={preference.inApp}
                  locked={preference.lockedInApp}
                  label={`${label}: in-app notifications`}
                  onChange={(value) => change(preference, "inApp", value)}
                />
              </div>
              <div className="flex items-center justify-between gap-2 sm:justify-center">
                <span className="text-xs text-muted-foreground sm:hidden">Email</span>
                <Toggle
                  checked={preference.email}
                  locked={preference.lockedEmail}
                  label={`${label}: email notifications`}
                  onChange={(value) => change(preference, "email", value)}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
