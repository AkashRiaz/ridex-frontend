import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, Clock, FileText, IdCard, Phone, Store, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import TableBackButton from "@/components/ui/TableBackButton";
import { StatusBadge } from "@/components/shared/UserBadges";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { formatRelativeDate } from "@/components/listing/ListingBits";
import { DOCUMENT_KIND_LABEL, ROLE_LABEL, VERIFICATION_TYPE_LABEL } from "@/lib/enum";
import { cn } from "@/lib/utils";
import { getMe } from "@/service/getMe";
import { IVerificationRequest, TSearchParams } from "@/types";
import {
  getMyVerificationAction,
  getVerificationRequestByIdAction,
} from "../../_actions/verificationActions";
import { CatalogError } from "../Catalog/CatalogStates";
import { VerificationStatusBadge } from "./VerificationBits";
import VerificationLoadingTable from "./VerificationLoadingTable";
import VerificationReviewPanel from "./VerificationReviewPanel";
import VerificationTable from "./VerificationTable";
import { DealerVerificationForm, IdVerificationForm } from "./VerificationForms";

const detailRows = (request: Pick<IVerificationRequest, "type" | "details">) =>
  request.type === "ID"
    ? [
        ["Name on NID", request.details.fullName],
        ["NID", request.details.nidLast4 ? `•••• ${request.details.nidLast4}` : undefined],
      ]
    : [
        ["Business", request.details.businessName],
        ["Trade license", request.details.tradeLicenseNumber],
        ["Showroom", [request.details.area, request.details.district, request.details.division].filter(Boolean).join(", ")],
      ];

const formatBytes = (bytes: number) =>
  bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

// ============================================
// Self-service
// ============================================

const BadgeCard = ({
  icon: Icon,
  title,
  verified,
  children,
}: {
  icon: typeof Phone;
  title: string;
  verified: boolean;
  children?: React.ReactNode;
}) => (
  <section className={cn("space-y-4 rounded-2xl border bg-card p-5", verified && "border-success/40")}>
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-xl",
            verified ? "bg-success/15 text-success" : "bg-muted text-muted-foreground",
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </div>
        <h2 className="font-semibold">{title}</h2>
      </div>
      {verified && (
        <span className="inline-flex items-center gap-1 text-sm font-medium text-success">
          <BadgeCheck className="size-4" aria-hidden="true" /> Verified
        </span>
      )}
    </div>
    {children}
  </section>
);

const LatestRequestNotice = ({ request }: { request: IVerificationRequest | null }) => {
  if (!request || request.status === "APPROVED") return null;

  if (request.status === "PENDING") {
    return (
      <p className="flex items-start gap-2 rounded-lg bg-warning/10 p-3 text-sm">
        <Clock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        Submitted {formatRelativeDate(request.createdAt).toLowerCase()} — waiting for review. We will notify you.
      </p>
    );
  }

  return (
    <p className="flex items-start gap-2 rounded-lg bg-destructive/5 p-3 text-sm">
      <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
      <span>
        Your last request was rejected: <span className="font-medium">{request.rejectionReason}</span> Fix it and submit
        again below.
      </span>
    </p>
  );
};

const MyVerification = async ({ dashboardPath }: { dashboardPath: string }) => {
  const [result, me] = await Promise.all([getMyVerificationAction(), getMe()]);

  if (!result.success || !result.data) {
    return <CatalogError title="Failed to load verification" message={result.message} />;
  }

  const { badges, requests } = result.data;
  const user = me.data;
  const canSubmitId = !badges.id.verified && badges.id.latestRequest?.status !== "PENDING";
  const canSubmitDealer =
    badges.dealer.applicable && !badges.dealer.verified && badges.dealer.latestRequest?.status !== "PENDING";

  return (
    <div className="space-y-6">
      <BadgeCard icon={Phone} title="Phone" verified={badges.phone.verified}>
        {badges.phone.verified ? (
          <p className="text-sm text-muted-foreground">{badges.phone.phone} is verified.</p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Verify your phone with a one-time code to earn the badge.{" "}
            <Link href={`${dashboardPath}/profile`} className="font-medium text-primary hover:underline">
              Go to profile
            </Link>
          </p>
        )}
      </BadgeCard>

      <BadgeCard icon={IdCard} title="National ID" verified={badges.id.verified}>
        {badges.id.verified ? (
          <p className="text-sm text-muted-foreground">
            Verified {formatRelativeDate(badges.id.verifiedAt).toLowerCase()}. Buyers see an &quot;ID verified&quot; badge on your listings.
          </p>
        ) : (
          <div className="space-y-4">
            <LatestRequestNotice request={badges.id.latestRequest} />
            {canSubmitId && <IdVerificationForm defaultName={user?.name ?? ""} />}
          </div>
        )}
      </BadgeCard>

      {badges.dealer.applicable && (
        <BadgeCard icon={Store} title="Dealership" verified={badges.dealer.verified}>
          {badges.dealer.verified ? (
            <p className="text-sm text-muted-foreground">
              Verified {formatRelativeDate(badges.dealer.verifiedAt).toLowerCase()}. Your listings show the &quot;Verified dealer&quot; badge.
            </p>
          ) : (
            <div className="space-y-4">
              <LatestRequestNotice request={badges.dealer.latestRequest} />
              {canSubmitDealer && (
                <DealerVerificationForm
                  defaults={{
                    businessName: user?.name ?? "",
                    division: user?.division ?? "",
                    district: user?.district ?? "",
                    area: user?.area ?? "",
                  }}
                />
              )}
            </div>
          )}
        </BadgeCard>
      )}

      {requests.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-semibold">History</h2>
          <ul className="divide-y rounded-2xl border bg-card">
            {requests.map((request) => (
              <li key={request.id} className="flex flex-wrap items-center justify-between gap-2 p-4 text-sm">
                <div>
                  <p className="font-medium">{VERIFICATION_TYPE_LABEL[request.type]}</p>
                  <p className="text-xs text-muted-foreground">
                    {request.documents.length} document{request.documents.length === 1 ? "" : "s"} · submitted{" "}
                    {formatRelativeDate(request.createdAt).toLowerCase()}
                  </p>
                  {request.rejectionReason && <p className="mt-1 text-xs text-destructive">{request.rejectionReason}</p>}
                </div>
                <VerificationStatusBadge status={request.status} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export const MyVerificationPage = ({ dashboardPath }: { dashboardPath: string }) => (
  <div className="mx-auto max-w-4xl space-y-5 p-2 md:p-5">
    <div>
      <h1 className="text-xl font-semibold">Verification</h1>
      <p className="text-sm text-muted-foreground">Verified badges help buyers trust you and your listings</p>
    </div>
    <Suspense fallback={<Skeleton className="h-[500px] w-full rounded-2xl" />}>
      <MyVerification dashboardPath={dashboardPath} />
    </Suspense>
  </div>
);

// ============================================
// Admin: queue
// ============================================

export const ManageVerificationsPage = async ({
  searchParams,
  dashboardPath,
}: {
  searchParams?: Promise<TSearchParams>;
  dashboardPath: string;
}) => {
  const params = await searchParams;

  return (
    <div className="space-y-4 p-2 md:p-5">
      <div>
        <h1 className="text-xl font-semibold">
          <TableBackButton />
          Verifications
        </h1>
        <p className="text-sm text-muted-foreground">ID and dealer documents, first come first served</p>
      </div>
      <Suspense key={JSON.stringify(params ?? {})} fallback={<VerificationLoadingTable />}>
        <VerificationTable searchParams={params} dashboardPath={dashboardPath} />
      </Suspense>
    </div>
  );
};

// ============================================
// Admin: detail
// ============================================

const VerificationDetail = async ({ requestId, dashboardPath }: { requestId: string; dashboardPath: string }) => {
  const [result, me] = await Promise.all([getVerificationRequestByIdAction(requestId), getMe()]);

  if (!result.success || !result.data) {
    if (result.statusCode === 404 || result.statusCode === 400) notFound();
    return <CatalogError title="Failed to load request" message={result.message} />;
  }

  const request = result.data;
  const user = request.user;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">
            <TableBackButton />
            {VERIFICATION_TYPE_LABEL[request.type]}
          </h1>
          <p className="text-sm text-muted-foreground">Submitted {formatRelativeDate(request.createdAt).toLowerCase()}</p>
        </div>
        <VerificationStatusBadge status={request.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold">Documents</h2>
            {request.documentUrlsExpireAt && (
              <p className="text-xs text-muted-foreground">Links expire in 10 minutes — reload the page for fresh ones.</p>
            )}
          </div>
          {request.documentsPurgedAt ? (
            <p className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
              Documents were deleted {formatRelativeDate(request.documentsPurgedAt).toLowerCase()} (30 days after the decision).
            </p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2">
              {request.documents.map((document) => (
                <li key={document.id} className="overflow-hidden rounded-xl border bg-card">
                  {document.url && document.format !== "pdf" ? (
                    <a href={document.url} target="_blank" rel="noopener noreferrer" className="block bg-muted">
                      {/* signed, short-lived private link — not routed through next/image */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={document.url}
                        alt={DOCUMENT_KIND_LABEL[document.kind]}
                        className="aspect-[4/3] w-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </a>
                  ) : (
                    <a
                      href={document.url ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex aspect-[4/3] flex-col items-center justify-center gap-2 bg-muted text-sm font-medium text-primary hover:underline"
                    >
                      <FileText className="size-8" aria-hidden="true" /> Open PDF
                    </a>
                  )}
                  <div className="flex items-center justify-between gap-2 px-3 py-2 text-xs">
                    <span className="font-medium">{DOCUMENT_KIND_LABEL[document.kind]}</span>
                    <span className="text-muted-foreground">
                      {document.format.toUpperCase()} · {formatBytes(document.bytes)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <VerificationReviewPanel
            request={request}
            listPath={`${dashboardPath}/verifications`}
            isOwnRequest={me.data?.id === user.id}
          />

          <section className="space-y-3 rounded-2xl border bg-card p-5 text-sm">
            <h2 className="font-semibold">Submitted details</h2>
            <dl className="space-y-2">
              {detailRows(request).map(([label, value]) => (
                <div key={label} className="grid grid-cols-[110px_1fr] gap-2">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-medium">{value || "—"}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="space-y-3 rounded-2xl border bg-card p-5 text-sm">
            <h2 className="font-semibold">Account</h2>
            <div className="flex items-center gap-3">
              <UserAvatar name={user.name} imageUrl={user.imageUrl} size={40} />
              <div className="min-w-0">
                <p className="font-medium">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email ?? "No email"}</p>
              </div>
            </div>
            <dl className="space-y-2">
              {[
                ["Role", ROLE_LABEL[user.role]],
                ["Phone", user.phone ? `${user.phone}${user.phoneVerified ? " ✓" : ""}` : "—"],
                ["Joined", formatRelativeDate(user.createdAt)],
              ].map(([label, value]) => (
                <div key={label} className="grid grid-cols-[110px_1fr] gap-2">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
              <div className="grid grid-cols-[110px_1fr] gap-2">
                <dt className="text-muted-foreground">Status</dt>
                <dd>
                  <StatusBadge status={user.status} />
                </dd>
              </div>
            </dl>
            <Link href={`${dashboardPath}/users/${user.id}`} className="inline-block font-medium text-primary hover:underline">
              Open user
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
};

export const VerificationDetailPage = async ({
  params,
  dashboardPath,
}: {
  params: Promise<{ verificationId: string }>;
  dashboardPath: string;
}) => {
  const { verificationId } = await params;

  return (
    <div className="mx-auto max-w-6xl p-2 md:p-5">
      <Suspense fallback={<Skeleton className="h-[600px] w-full rounded-2xl" />}>
        <VerificationDetail requestId={verificationId} dashboardPath={dashboardPath} />
      </Suspense>
    </div>
  );
};
