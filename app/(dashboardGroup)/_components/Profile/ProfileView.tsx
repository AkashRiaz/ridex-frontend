import { AlertCircle, AlertTriangle, Mail, Phone } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { RoleBadge, StatusBadge, VerifiedBadge } from "@/components/shared/UserBadges";
import { getDashboardPath, getProfilePath } from "@/lib/dashboardPath";
import { TSearchParams } from "@/types";
import { getMyProfileAction } from "../../_actions/profileActions";
import ChangePasswordForm from "./ChangePasswordForm";
import DeleteAccount from "./DeleteAccount";
import PhoneVerification from "./PhoneVerification";
import ProfileForm from "./ProfileForm";

type ProfileTab = "profile" | "security" | "account";

const TABS: { value: ProfileTab; label: string }[] = [
  { value: "profile", label: "Profile" },
  { value: "security", label: "Security" },
  { value: "account", label: "Account" },
];

const getValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const ProfileView = async ({ searchParams }: { searchParams?: TSearchParams }) => {
  const result = await getMyProfileAction();

  if (!result.success || !result.data) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-card p-10 text-center shadow-sm">
        <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="size-5" />
        </div>
        <h3 className="mt-4 font-semibold text-destructive">Failed to load your profile</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {result.message || "Something went wrong while loading your profile."}
        </p>
      </div>
    );
  }

  const user = result.data;
  const basePath = getProfilePath(user.role);
  const requestedTab = getValue(searchParams?.tab);
  const activeTab: ProfileTab = TABS.some((tab) => tab.value === requestedTab)
    ? (requestedTab as ProfileTab)
    : "profile";
  const isPasswordChangeRequired = user.needPasswordChange;
  const hasPassword = user.authProvider !== "GOOGLE";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-card sm:flex-row sm:items-center">
        <UserAvatar name={user.name} imageUrl={user.imageUrl} size={64} />

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-xl font-bold">{user.name}</h1>
            <RoleBadge role={user.role} />
            <StatusBadge status={user.status} />
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
            {user.email && (
              <span className="inline-flex items-center gap-1.5">
                <Mail className="size-3.5" aria-hidden="true" />
                {user.email}
              </span>
            )}
            {user.phone && (
              <span className="inline-flex items-center gap-1.5">
                <Phone className="size-3.5" aria-hidden="true" />
                {user.phone}
              </span>
            )}
          </div>
        </div>
      </div>

      {user.status === "PENDING" && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Your dealer account is pending approval. You can complete your profile now; dealer
          tools unlock after verification.
        </div>
      )}

      {isPasswordChangeRequired && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
          You are using a temporary password. Please set a new password to continue.
        </div>
      )}

      <Tabs>
        <TabsList>
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              href={tab.value === "profile" ? basePath : `${basePath}?tab=${tab.value}`}
              active={activeTab === tab.value}
              replace
              scroll={false}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <section className="rounded-2xl border bg-card p-5 shadow-card sm:p-7">
        {activeTab === "profile" && <ProfileForm key={user.updatedAt} user={user} />}

        {activeTab === "security" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold">
                {hasPassword ? "Change password" : "Set a password"}
              </h2>
              <p className="mb-5 text-sm text-muted-foreground">
                {hasPassword
                  ? "Use a strong password you don't use anywhere else."
                  : "You signed up with Google. Set a password to also sign in with email."}
              </p>
              <ChangePasswordForm
                hasPassword={hasPassword}
                redirectOnSuccess={
                  isPasswordChangeRequired ? (getDashboardPath(user.role) ?? "/") : undefined
                }
              />
            </div>

            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold">Verification</h2>
              <p className="mb-4 text-sm text-muted-foreground">
                Verified contacts build trust with buyers and sellers.
              </p>
              <ul className="space-y-3">
                <li className="flex flex-wrap items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 text-sm">
                    <Mail className="size-4 text-muted-foreground" aria-hidden="true" />
                    {user.email ?? "No email added"}
                  </span>
                  {user.email && <VerifiedBadge verified={user.emailVerified} label="Email" />}
                </li>
                <li className="flex flex-wrap items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 text-sm">
                    <Phone className="size-4 text-muted-foreground" aria-hidden="true" />
                    {user.phone ?? "No phone added"}
                  </span>
                  {user.phone && <VerifiedBadge verified={user.phoneVerified} label="Phone" />}
                </li>
              </ul>
              {user.phone && !user.phoneVerified && (
                <div className="mt-4">
                  <PhoneVerification phone={user.phone} />
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "account" && (
          <div className="space-y-6">
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Member since</dt>
                <dd className="font-medium">
                  {new Date(user.createdAt).toLocaleDateString(undefined, { dateStyle: "long" })}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Last login</dt>
                <dd className="font-medium">
                  {user.lastLoginAt
                    ? new Date(user.lastLoginAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : "—"}
                </dd>
              </div>
            </dl>

            {user.role !== "SUPER_ADMIN" && <DeleteAccount hasPassword={hasPassword} />}
          </div>
        )}
      </section>
    </div>
  );
};

export default ProfileView;
