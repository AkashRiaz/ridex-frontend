import Image from "next/image";

/*
 * Square thumbnail for brand logos / model images, with initials fallback.
 */
export function CatalogThumb({
  name,
  imageUrl,
  size = 36,
}: {
  name: string;
  imageUrl?: string | null;
  size?: number;
}) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");

  return (
    <div
      className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted/40 font-semibold text-muted-foreground"
      style={{ width: size, height: size, fontSize: Math.max(11, size * 0.34) }}
    >
      {imageUrl ? (
        <Image src={imageUrl} alt={`${name} logo`} fill sizes={`${size}px`} className="object-contain p-1" />
      ) : (
        <span aria-hidden="true">{initials || "?"}</span>
      )}
    </div>
  );
}
