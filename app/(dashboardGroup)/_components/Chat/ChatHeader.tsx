"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Archive, ArchiveRestore, ArrowLeft, Ban, ExternalLink, Loader2, MoreVertical, ShieldCheck } from "lucide-react";
import Swal from "sweetalert2";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ListingStatusBadge } from "@/components/listing/ListingBits";
import { ReportDialog } from "@/components/shared/ReportDialog";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { formatCurrency } from "@/lib/formatCurrency";
import { IConversationDetail } from "@/types";
import { archiveConversationAction } from "../../_actions/chatActions";
import { setUserBlockedAction } from "../../_actions/userBlockActions";

export function ChatHeader({
  conversation,
  dashboardPath,
  isTyping,
}: {
  conversation: IConversationDetail;
  dashboardPath: string;
  isTyping: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { counterpart, listing } = conversation;
  const verified = counterpart.badges.idVerified || counterpart.badges.dealerVerified || counterpart.badges.phoneVerified;

  const toggleArchive = () =>
    startTransition(async () => {
      const result = await archiveConversationAction(conversation.id, !conversation.isArchived);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });

  const toggleBlock = async () => {
    const blocking = !conversation.block.blockedByMe;

    if (blocking) {
      const confirmation = await Swal.fire({
        title: `Block ${counterpart.name}?`,
        text: "Neither of you will be able to send messages. You can unblock them later.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Block",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#dc2626",
        reverseButtons: true,
      });
      if (!confirmation.isConfirmed) return;
    }

    startTransition(async () => {
      const result = await setUserBlockedAction(counterpart.id, blocking);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  };

  const status = counterpart.isDeleted ? null : isTyping ? "typing…" : counterpart.isOnline ? "online" : null;

  return (
    <header className="shrink-0 border-b bg-background">
      <div className="flex items-center gap-3 px-3 py-2.5 sm:px-4">
        <Link
          href={`${dashboardPath}/messages`}
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-md transition hover:bg-muted md:hidden"
          aria-label="Back to conversations"
        >
          <ArrowLeft className="size-5" aria-hidden="true" />
        </Link>

        <div className="relative">
          <UserAvatar name={counterpart.name} imageUrl={counterpart.imageUrl} size={40} />
          {counterpart.isOnline && (
            <span
              className="absolute right-0 bottom-0 size-3 rounded-full border-2 border-background bg-success"
              aria-hidden="true"
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 truncate font-semibold">
            {counterpart.isDeleted ? (
              counterpart.name
            ) : (
              <Link href={`/sellers/${counterpart.id}`} className="truncate hover:underline">
                {counterpart.name}
              </Link>
            )}
            {verified && <ShieldCheck className="size-4 shrink-0 text-success" aria-label="Verified" />}
          </p>
          <p className="truncate text-xs text-muted-foreground" aria-live="polite">
            {status ?? (conversation.side === "buyer" ? "Seller" : "Buyer")}
          </p>
        </div>

        {isPending && <Loader2 className="size-4 animate-spin text-muted-foreground" aria-label="Working" />}

        {!counterpart.isDeleted && (
          <ReportDialog
            targetType="USER"
            targetId={counterpart.id}
            isSignedIn
            label="Report"
            triggerClassName="hidden rounded-md px-2 py-1.5 sm:inline-flex"
          />
        )}

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="inline-flex size-9 items-center justify-center rounded-md transition hover:bg-muted"
                aria-label="Conversation options"
              />
            }
          >
            <MoreVertical className="size-5" aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            {!listing.isDeleted && (
              <DropdownMenuItem onClick={() => router.push(`/listings/${listing.slug}`)}>
                <ExternalLink className="size-4" aria-hidden="true" /> View listing
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={toggleArchive}>
              {conversation.isArchived ? (
                <>
                  <ArchiveRestore className="size-4" aria-hidden="true" /> Move to inbox
                </>
              ) : (
                <>
                  <Archive className="size-4" aria-hidden="true" /> Archive
                </>
              )}
            </DropdownMenuItem>
            {!counterpart.isDeleted && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant={conversation.block.blockedByMe ? "default" : "destructive"} onClick={toggleBlock}>
                  <Ban className="size-4" aria-hidden="true" />
                  {conversation.block.blockedByMe ? "Unblock" : "Block"} {counterpart.name.split(" ")[0]}
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* the listing this conversation is about */}
      <div className="flex items-center gap-3 border-t bg-muted/30 px-4 py-2">
        <div className="relative size-10 shrink-0 overflow-hidden rounded-md bg-muted">
          {listing.coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={listing.coverImage} alt="" className="size-full object-cover" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          {listing.isDeleted ? (
            <p className="truncate text-sm font-medium text-muted-foreground">{listing.title}</p>
          ) : (
            <Link href={`/listings/${listing.slug}`} className="block truncate text-sm font-medium hover:underline">
              {listing.title}
            </Link>
          )}
          <p className="text-xs font-semibold text-primary">{formatCurrency(listing.price)}</p>
        </div>
        {listing.status !== "APPROVED" && !listing.isDeleted && <ListingStatusBadge status={listing.status} />}
      </div>
    </header>
  );
}
