"use client";

import { CalendarClock, MapPin } from "lucide-react";
import { TestRideStatusBadge } from "@/components/testRide/TestRideStatusBadge";
import { TestRideActions, getTestRideActions } from "@/components/testRide/TestRideActions";
import { formatMessageTime } from "@/lib/formatChatTime";
import { formatRideDateTime } from "@/lib/formatRideTime";
import { cn } from "@/lib/utils";
import { IChatMessage, IConversation, ITestRideCard } from "@/types";

type TestRideCardProps = {
  message: IChatMessage & { testRide: ITestRideCard };
  mine: boolean;
  conversation: Pick<IConversation, "side">;
  canReply: boolean;
};

/*
 * A test ride request inside the chat; status is live (socket "testRide:updated").
 */
export function TestRideCard({ message, mine, conversation, canReply }: TestRideCardProps) {
  const ride = message.testRide;
  const actions = canReply ? getTestRideActions(ride, conversation.side) : [];
  const isActive = ride.status === "REQUESTED" || ride.status === "CONFIRMED";

  return (
    <div className={cn("mt-3 flex", mine ? "justify-end" : "justify-start")}>
      <article
        className={cn(
          "w-full max-w-xs overflow-hidden rounded-2xl border bg-card shadow-xs",
          ride.status === "CONFIRMED" ? "border-success/40" : isActive ? "border-primary/40" : "opacity-90",
        )}
        aria-label={`Test ride ${formatRideDateTime(ride.startsAt)}, ${ride.status.toLowerCase()}`}
      >
        <header className="flex items-center justify-between gap-2 border-b bg-muted/40 px-3.5 py-2">
          <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <CalendarClock className="size-3.5" aria-hidden="true" /> Test ride {mine ? "request" : "requested"}
          </span>
          <TestRideStatusBadge status={ride.status} />
        </header>

        <div className="space-y-2 px-3.5 py-3">
          <p className={cn("text-base font-semibold", !isActive && ride.status !== "COMPLETED" && "line-through decoration-1 opacity-60")}>
            {formatRideDateTime(ride.startsAt)}
          </p>
          {message.body && <p className="whitespace-pre-wrap wrap-break-word rounded-lg bg-muted/60 px-3 py-2 text-sm">{message.body}</p>}
          {ride.status === "CONFIRMED" && ride.sellerNote && (
            <p className="flex items-start gap-1.5 text-sm">
              <MapPin className="mt-0.5 size-3.5 shrink-0 text-success" aria-hidden="true" />
              {ride.sellerNote}
            </p>
          )}
          {ride.status === "REQUESTED" && (
            <p className="text-xs text-muted-foreground">
              {conversation.side === "seller"
                ? "Confirm before the start time, or the request expires."
                : "Waiting for the seller to confirm."}
            </p>
          )}

          {actions.length > 0 && (
            <div className="pt-1">
              <TestRideActions ride={ride} actions={actions} />
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
