"use client";

import { AlertCircle, Check, CheckCheck, Clock, RotateCcw } from "lucide-react";
import { ReportDialog } from "@/components/shared/ReportDialog";
import { formatMessageTime } from "@/lib/formatChatTime";
import { cn } from "@/lib/utils";
import { IChatMessage } from "@/types";

type MessageBubbleProps = {
  message: IChatMessage;
  mine: boolean;
  seen: boolean;
  // first bubble of a run from the same sender (adds spacing)
  startsGroup: boolean;
  onRetry?: (message: IChatMessage) => void;
};

const DeliveryState = ({ message, seen }: { message: IChatMessage; seen: boolean }) => {
  if (message.failed) {
    return (
      <span className="inline-flex items-center gap-0.5 text-destructive">
        <AlertCircle className="size-3" aria-hidden="true" /> Not sent
      </span>
    );
  }

  if (message.pending) return <Clock className="size-3" aria-label="Sending" />;

  return seen ? (
    <CheckCheck className="size-3.5 text-sky-500" aria-label="Seen" />
  ) : (
    <Check className="size-3.5" aria-label="Sent" />
  );
};

export function MessageBubble({ message, mine, seen, startsGroup, onRetry }: MessageBubbleProps) {
  if (message.type === "SYSTEM") {
    return (
      <div className="my-3 flex justify-center">
        <p className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">{message.body}</p>
      </div>
    );
  }

  const imageSrc = message.localImageUrl ?? message.imageUrl;
  const canReport = !mine && !message.pending && !message.id.startsWith("local-");

  return (
    <div className={cn("group flex", mine ? "justify-end" : "justify-start", startsGroup ? "mt-3" : "mt-0.5")}>
      <div className={cn("flex max-w-[85%] items-end gap-1.5 sm:max-w-[70%]", mine && "flex-row-reverse")}>
        <div
          className={cn(
            "overflow-hidden rounded-2xl text-sm shadow-xs",
            mine ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md bg-muted text-foreground",
            message.failed && "opacity-70",
          )}
        >
          {message.type === "IMAGE" && imageSrc ? (
            <a
              href={message.imageUrl ?? undefined}
              target="_blank"
              rel="noreferrer"
              className={cn("block", !message.imageUrl && "pointer-events-none")}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageSrc}
                alt={mine ? "Photo you sent" : "Photo sent to you"}
                loading="lazy"
                className={cn("max-h-72 w-full max-w-xs object-cover", message.pending && "animate-pulse")}
              />
            </a>
          ) : (
            <p className="whitespace-pre-wrap break-words px-3.5 py-2">{message.body}</p>
          )}
          <p
            className={cn(
              "flex items-center justify-end gap-1 px-3 pb-1.5 text-[10px]",
              message.type === "IMAGE" && "pt-1",
              mine ? "text-primary-foreground/75" : "text-muted-foreground",
            )}
          >
            <time dateTime={message.createdAt}>{formatMessageTime(message.createdAt)}</time>
            {mine && <DeliveryState message={message} seen={seen} />}
          </p>
        </div>

        {mine && message.failed && onRetry && (
          <button
            type="button"
            onClick={() => onRetry(message)}
            className="inline-flex size-7 shrink-0 items-center justify-center rounded-full text-destructive transition hover:bg-destructive/10"
            aria-label="Retry sending"
            title="Retry"
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
          </button>
        )}

        {canReport && (
          <div className="shrink-0 opacity-0 transition group-focus-within:opacity-100 group-hover:opacity-100">
            <ReportDialog
              targetType="MESSAGE"
              targetId={message.id}
              isSignedIn
              label="Report"
              triggerClassName="rounded-md px-1.5 py-1 text-[11px]"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export function TypingIndicator({ name }: { name: string }) {
  return (
    <div className="mt-3 flex items-center gap-2" aria-live="polite">
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-muted px-3.5 py-3" aria-hidden="true">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="size-1.5 animate-bounce rounded-full bg-muted-foreground/70 motion-reduce:animate-none"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
      <span className="sr-only">{name} is typing</span>
    </div>
  );
}
