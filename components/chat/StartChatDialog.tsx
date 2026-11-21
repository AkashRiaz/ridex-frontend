"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2, MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { startConversationAction } from "@/app/(dashboardGroup)/_actions/chatActions";
import { getQuickRepliesAction } from "@/app/(dashboardGroup)/_actions/quickReplyActions";
import { getDashboardPath } from "@/lib/dashboardPath";
import { isChatRole } from "@/lib/enum";
import { cn } from "@/lib/utils";
import { Role } from "@/types";

const MAX_LENGTH = 2000;

type StartChatDialogProps = {
  listingId: string;
  listingTitle: string;
  sellerName: string;
  isSignedIn: boolean;
  viewerRole: Role | null;
  className?: string;
};

/*
 * "Chat with seller": pick a quick reply or write a first message.
 * Opens the existing thread if there already is one (the backend reuses it).
 */
export function StartChatDialog({
  listingId,
  listingTitle,
  sellerName,
  isSignedIn,
  viewerRole,
  className,
}: StartChatDialogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [quickReplies, setQuickReplies] = useState<{ key: string; text: string }[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // staff accounts do not buy; they see messages only through reports
  if (isSignedIn && !isChatRole(viewerRole)) return null;

  const openDialog = () => {
    if (!isSignedIn) {
      router.push(`/login?redirectTo=${encodeURIComponent(pathname)}`);
      return;
    }

    setOpen(true);
    if (!quickReplies.length) {
      getQuickRepliesAction().then((result) => {
        if (result.success && result.data) setQuickReplies(result.data.builtIn.buyer);
      });
    }
  };

  const pick = (reply: { key: string; text: string }) => {
    setSelectedKey(reply.key);
    setText(reply.text);
  };

  const send = () => {
    const body = text.trim();
    if (!body) return;

    // an untouched quick reply is sent by key; edited text is sent as-is
    const quickReply = quickReplies.find((reply) => reply.key === selectedKey && reply.text === body);

    startTransition(async () => {
      const result = await startConversationAction({
        listingId,
        ...(quickReply ? { quickReplyKey: quickReply.key } : { body }),
        clientId: crypto.randomUUID(),
      });

      if (result.success && result.data) {
        toast.success(result.message);
        setOpen(false);
        router.push(`${getDashboardPath(viewerRole)}/messages/${result.data.conversation.id}`);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <>
      <Button type="button" onClick={openDialog} className={cn("w-full", className)}>
        <MessageCircle className="size-4" aria-hidden="true" /> Chat with seller
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Message {sellerName}</DialogTitle>
            <DialogDescription className="line-clamp-2">About: {listingTitle}</DialogDescription>
          </DialogHeader>

          {quickReplies.length > 0 && (
            <div className="flex flex-wrap gap-2" aria-label="Quick questions">
              {quickReplies.map((reply) => (
                <button
                  key={reply.key}
                  type="button"
                  onClick={() => pick(reply)}
                  aria-pressed={selectedKey === reply.key && text === reply.text}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition hover:border-primary hover:bg-primary/5",
                    selectedKey === reply.key && text === reply.text && "border-primary bg-primary/10 text-primary",
                  )}
                >
                  {reply.text}
                </button>
              ))}
            </div>
          )}

          <div className="space-y-1">
            <label htmlFor="start-chat-message" className="text-sm font-medium">
              Your message
            </label>
            <Textarea
              id="start-chat-message"
              rows={4}
              maxLength={MAX_LENGTH}
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Hi, is this still available?"
            />
            <p className="text-xs text-muted-foreground">
              Keep payments and personal details off chat until you have seen the vehicle.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="button" onClick={send} disabled={isPending || !text.trim()}>
              {isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="size-4" aria-hidden="true" />
              )}
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
