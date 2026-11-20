import { AlertCircle, AlertTriangle } from "lucide-react";
import TableBackButton from "@/components/ui/TableBackButton";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { RoleBadge, StatusBadge, VerifiedBadge } from "@/components/shared/UserBadges";
import { GENDER_LABEL } from "@/lib/enum";
import { canManageUser } from "@/lib/permissions";
import { Role } from "@/types";
import { getUserByIdAction } from "../../_actions/userActions";
import UserDelete from "./UserDelete";
import UserRestore from "./UserRestore";
import UserRoleUpdate from "./UserRoleUpdate";
import UserStatusUpdate from "./UserStatusUpdate";

type UserDetailsProps = {
  userId: string;
  actor: { id: string; role: Role };
  // users list of the current dashboard, e.g. "/admin-dashboard/users"
  listPath: string;
};

const formatDate = (value: string | null, withTime = false) =>
  value
    ? new Date(value).toLocaleString(undefined, {
        dateStyle: "medium",
        ...(withTime && { timeStyle: "short" }),
      })
    : "—";

const UserDetails = async ({ userId, actor, listPath }: UserDetailsProps) => {
  const result = await getUserByIdAction(userId);

  if (!result.success || !result.data) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-card p-10 text-center shadow-sm">
        <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="size-5" />
        </div>
        <h3 className="mt-4 font-semibold text-destructive">Failed to load user</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {result.message || "Something went wrong while loading this user."}
        </p>
      </div>
    );
  }

  const user = result.data;
  const canManage = canManageUser(actor, user);
  const canChangeRole = canManage && actor.role === "SUPER_ADMIN" && !user.isDeleted;

  const details: { label: string; value: string }[] = [
    { label: "Email", value: user.email ?? "—" },
    { label: "Phone", value: user.phone ?? "—" },
    { label: "Sign-in method", value: user.authProvider.toLowerCase() },
    { label: "Gender", value: user.gender ? GENDER_LABEL[user.gender] : "—" },
    { label: "Date of birth", value: formatDate(user.dateOfBirth) },
    {
      label: "Location",
      value: [user.area, user.district, user.division].filter(Boolean).join(", ") || "—",
    },
    { label: "Joined", value: formatDate(user.createdAt) },
    { label: "Last login", value: formatDate(user.lastLoginAt, true) },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">
        <TableBackButton />
        User details
      </h2>

      <div className="flex flex-col gap-5 rounded-2xl border bg-card p-6 shadow-card sm:flex-row sm:items-start">
        <UserAvatar name={user.name} imageUrl={user.imageUrl} size={72} />

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-bold">{user.name}</h3>
            <RoleBadge role={user.role} />
            <StatusBadge status={user.status} isDeleted={user.isDeleted} />
          </div>
          <div className="flex flex-wrap gap-4">
            {user.email && <VerifiedBadge verified={user.emailVerified} label="Email" />}
            {user.phone && <VerifiedBadge verified={user.phoneVerified} label="Phone" />}
          </div>
          {user.bio && <p className="text-sm text-muted-foreground">{user.bio}</p>}
        </div>

        {canManage && (
          <div className="flex shrink-0 flex-wrap gap-2">
            {user.isDeleted ? (
              <UserRestore userId={user.id} userName={user.name} showLabel />
            ) : (
              <>
                <UserStatusUpdate
                  userId={user.id}
                  userName={user.name}
                  status={user.status}
                  showLabel
                />
                <UserDelete
                  userId={user.id}
                  userName={user.name}
                  showLabel
                  redirectTo={listPath}
                />
              </>
            )}
          </div>
        )}
      </div>

      {user.status === "BLOCKED" && user.blockedReason && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
          <div>
            <p className="font-medium">Blocked on {formatDate(user.blockedAt, true)}</p>
            <p className="text-muted-foreground">Reason: {user.blockedReason}</p>
          </div>
        </div>
      )}

      <dl className="grid gap-x-8 gap-y-4 rounded-2xl border bg-card p-6 shadow-card sm:grid-cols-2">
        {details.map((detail) => (
          <div key={detail.label}>
            <dt className="text-sm text-muted-foreground">{detail.label}</dt>
            <dd className="font-medium first-letter:uppercase">{detail.value}</dd>
          </div>
        ))}
      </dl>

      {canChangeRole && (
        <div className="rounded-2xl border bg-card p-6 shadow-card">
          <h3 className="font-semibold">Role</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Changing the role signs the user out of every device.
          </p>
          <UserRoleUpdate userId={user.id} userName={user.name} currentRole={user.role} />
        </div>
      )}
    </div>
  );
};

export default UserDetails;
