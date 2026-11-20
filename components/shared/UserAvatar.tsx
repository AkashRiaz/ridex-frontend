import Image from "next/image";
import { cn } from "@/lib/utils";

type UserAvatarProps = {
  name?: string | null;
  imageUrl?: string | null;
  size?: number;
  className?: string;
};

const getInitials = (name?: string | null) =>
  (name ?? "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";

export function UserAvatar({
  name,
  imageUrl,
  size = 40,
  className,
}: UserAvatarProps) {
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 font-semibold text-primary",
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.max(12, size * 0.38) }}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={name ? `${name}'s avatar` : "User avatar"}
          fill
          sizes={`${size}px`}
          className="object-cover"
        />
      ) : (
        <span aria-hidden="true">{getInitials(name)}</span>
      )}
    </div>
  );
}
