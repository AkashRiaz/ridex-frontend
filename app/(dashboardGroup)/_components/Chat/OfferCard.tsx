"use client";

import { useEffect, useState } from "react";
import { HandCoins, Timer } from "lucide-react";
import { OfferActions, getOfferActions } from "@/components/offer/OfferActions";
import { OfferStatusBadge } from "@/components/offer/OfferStatusBadge";
import { formatMessageTime } from "@/lib/formatChatTime";
import { formatCurrency } from "@/lib/formatCurrency";
import { formatTimeLeft } from "@/lib/formatRideTime";
import { cn } from "@/lib/utils";
import { IChatMessage, IConversation, IOfferCard } from "@/types";

type OfferCardProps = {
  message: IChatMessage & { offer: IOfferCard };
  mine: boolean;
  meId: string;
  conversation: Pick<IConversation, "side" | "listing">;
  canReply: boolean;
};

/*
 * An offer inside the chat. Its status is live (socket "offer:updated"),
 * so an old card shows "Countered" once a newer offer replaces it.
 */
export function OfferCard({ message, mine, meId, conversation, canReply }: OfferCardProps) {
  const { offer } = message;
  // re-render every minute so the countdown and the expiry cut-off stay true
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (offer.status !== "PENDING") return;
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, [offer.status]);

  const actions = canReply ? getOfferActions(offer, meId, now) : [];
  const isOpen = offer.status === "PENDING";
  const title = offer.round > 1 ? (mine ? "Your counter offer" : "Counter offer") : mine ? "Your offer" : "Offer";
  const belowAsking = conversation.listing.price - offer.amount;

  return (
    <div className={cn("mt-3 flex", mine ? "justify-end" : "justify-start")}>
      <article
        className={cn(
          "w-full max-w-xs overflow-hidden rounded-2xl border bg-card shadow-xs",
          isOpen ? "border-primary/40" : "opacity-90",
        )}
        aria-label={`${title}: ${formatCurrency(offer.amount)}, ${offer.status.toLowerCase()}`}
      >
        <header className="flex items-center justify-between gap-2 border-b bg-muted/40 px-3.5 py-2">
          <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <HandCoins className="size-3.5" aria-hidden="true" /> {title}
          </span>
          <OfferStatusBadge status={offer.status} />
        </header>

        <div className="space-y-2 px-3.5 py-3">
          <p className={cn("text-2xl font-bold tracking-tight", !isOpen && offer.status !== "ACCEPTED" && "line-through decoration-1 opacity-60")}>
            {formatCurrency(offer.amount)}
          </p>
          {belowAsking > 0 && (
            <p className="text-xs text-muted-foreground">
              {formatCurrency(belowAsking)} below the asking price of {formatCurrency(conversation.listing.price)}
            </p>
          )}
          {message.body && <p className="whitespace-pre-wrap wrap-break-word rounded-lg bg-muted/60 px-3 py-2 text-sm">{message.body}</p>}

          {isOpen && (
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Timer className="size-3.5" aria-hidden="true" /> {formatTimeLeft(offer.expiresAt, now)}
              {mine && " · waiting for a reply"}
            </p>
          )}

          {actions.length > 0 && (
            <div className="pt-1">
              <OfferActions
                offer={offer}
                actions={actions}
                side={conversation.side}
                listingTitle={conversation.listing.title}
                listingPrice={conversation.listing.price}
              />
            </div>
          )}
        </div>

        <footer className="px-3.5 pb-2 text-right text-[10px] text-muted-foreground">
          <time dateTime={message.createdAt}>{formatMessageTime(message.createdAt)}</time>
        </footer>
      </article>
    </div>
  );
}
