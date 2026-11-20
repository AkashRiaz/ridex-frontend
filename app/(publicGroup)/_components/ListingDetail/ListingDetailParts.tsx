import { BadgeCheck, CalendarDays, MapPin, ShieldCheck } from "lucide-react";
import { formatSpecValue } from "@/components/dynamicForm/SpecValue";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { ROLE_LABEL } from "@/lib/enum";
import { IListingDetail, IListingSeller, IVehicleAttribute, TSpecs } from "@/types";

/*
 * Specs grouped exactly like the vehicle type's attribute schema.
 */
export function ListingSpecsTable({
  attributes,
  specs,
}: {
  attributes: IVehicleAttribute[];
  specs: TSpecs;
}) {
  const groups = attributes
    .slice()
    .sort((first, second) => first.sortOrder - second.sortOrder)
    .reduce<Record<string, { label: string; value: string }[]>>((acc, attribute) => {
      const value = formatSpecValue(attribute, specs[attribute.key]);
      if (!value) return acc;
      const group = attribute.group || "General";
      acc[group] = [...(acc[group] ?? []), { label: attribute.label, value }];
      return acc;
    }, {});

  const entries = Object.entries(groups);

  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">The seller has not added specs yet.</p>;
  }

  return (
    <div className="space-y-6">
      {entries.map(([group, rows]) => (
        <section key={group}>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{group}</h3>
          <dl className="divide-y rounded-xl border">
            {rows.map((row) => (
              <div key={row.label} className="grid grid-cols-2 gap-4 px-4 py-2.5 text-sm">
                <dt className="text-muted-foreground">{row.label}</dt>
                <dd className="font-medium">{row.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}

export function SellerCard({ seller }: { seller: IListingSeller }) {
  const isVerified = seller.emailVerified || seller.phoneVerified;
  const location = [seller.district, seller.division].filter(Boolean).join(", ");

  return (
    <section className="rounded-2xl border bg-card p-5 shadow-card" aria-label="Seller">
      <div className="flex items-center gap-3">
        <UserAvatar name={seller.name} imageUrl={seller.imageUrl} size={48} />
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 truncate font-semibold">
            {seller.name}
            {isVerified && <BadgeCheck className="size-4 shrink-0 text-success" aria-label="Verified contact" />}
          </p>
          <p className="text-sm text-muted-foreground">
            {seller.role === "DEALER" ? "Dealer" : ROLE_LABEL[seller.role] === "Seller" ? "Private seller" : ROLE_LABEL[seller.role]}
          </p>
        </div>
      </div>

      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
        <li className="flex items-center gap-2">
          <CalendarDays className="size-4" aria-hidden="true" />
          Member since {new Date(seller.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
        </li>
        {location && (
          <li className="flex items-center gap-2">
            <MapPin className="size-4" aria-hidden="true" />
            {location}
          </li>
        )}
        <li className="flex items-center gap-2">
          <ShieldCheck className="size-4" aria-hidden="true" />
          {seller.phoneVerified ? "Phone verified" : seller.emailVerified ? "Email verified" : "Not verified yet"}
        </li>
      </ul>

      <p className="mt-4 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
        Chat with the seller is coming soon. Meet in a safe public place and inspect the papers before paying.
      </p>
    </section>
  );
}

const getYouTubeId = (url: string) => {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\.|^m\./, "");

    if (host === "youtu.be") return parsed.pathname.slice(1) || null;
    if (host === "youtube.com") {
      if (parsed.pathname === "/watch") return parsed.searchParams.get("v");
      const match = parsed.pathname.match(/^\/(shorts|embed)\/([\w-]+)/);
      return match?.[2] ?? null;
    }
  } catch {
    return null;
  }

  return null;
};

export function ListingVideo({ url, title }: { url: string; title: string }) {
  const youTubeId = getYouTubeId(url);

  if (youTubeId && /^[\w-]{6,20}$/.test(youTubeId)) {
    return (
      <div className="aspect-video overflow-hidden rounded-2xl border bg-black">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${youTubeId}`}
          title={`Video of ${title}`}
          loading="lazy"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="size-full"
        />
      </div>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
    >
      Watch the video walkaround ↗
    </a>
  );
}

export const getStatusNotice = (listing: IListingDetail) => {
  switch (listing.status) {
    case "DRAFT":
      return "This is a draft. Only you can see it until you submit it for review.";
    case "PENDING":
      return "Waiting for review. It becomes public once a moderator approves it.";
    case "REJECTED":
      return `Rejected: ${listing.rejectionReason ?? "see the moderator note"}. Edit and resubmit it.`;
    case "EXPIRED":
      return "This listing has expired and is hidden from search. Renew it from your dashboard.";
    case "SOLD":
      return "This vehicle has been sold.";
    default:
      return null;
  }
};
