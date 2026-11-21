"use client";

import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { ImagePlus, Send, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { IQuickReplies, TConversationSide } from "@/types";
import { getQuickRepliesAction } from "../../_actions/quickReplyActions";
import { QuickReplyManager } from "./QuickReplyManager";

export const MAX_MESSAGE_LENGTH = 2000;
export const MAX_CHAT_IMAGES = 4;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

type MessageComposerProps = {
  side: TConversationSide;
  onSendText: (payload: { text: string; body?: string; quickReplyKey?: string }) => void;
  onSendImages: (files: File[]) => void;
  onTyping: () => void;
  onStopTyping: () => void;
};

/*
 * Textarea (Enter sends, Shift+Enter adds a line), photo picker and quick-reply chips.
 */
export function MessageComposer({ side, onSendText, onSendImages, onTyping, onStopTyping }: MessageComposerProps) {
  const [text, setText] = useState("");
  const [replies, setReplies] = useState<IQuickReplies | null>(null);
  const [managerOpen, setManagerOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    getQuickRepliesAction().then((result) => {
      if (!cancelled && result.success && result.data) setReplies(result.data);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // grow with the content, up to ~6 lines
  useEffect(() => {
    const element = textareaRef.current;
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${Math.min(element.scrollHeight, 160)}px`;
  }, [text]);

  const submit = () => {
    const value = text.trim();
    if (!value) return;

    onSendText({ text: value, body: value });
    setText("");
    onStopTyping();
    textareaRef.current?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  };

  const pickImages = (list: FileList | null) => {
    const files = Array.from(list ?? []);
    if (fileRef.current) fileRef.current.value = "";
    if (!files.length) return;

    if (files.length > MAX_CHAT_IMAGES) {
      toast.error(`You can send up to ${MAX_CHAT_IMAGES} photos at once`);
      return;
    }

    if (files.some((file) => !ALLOWED_IMAGE_TYPES.includes(file.type))) {
      toast.error("Only JPG, PNG, WEBP or AVIF photos can be sent");
      return;
    }

    // large photos are compressed before upload; only reject truly huge files
    if (files.some((file) => file.size > MAX_IMAGE_BYTES * 4)) {
      toast.error("One of the photos is too large");
      return;
    }

    onSendImages(files);
  };

  const chips = [
    ...(replies?.builtIn[side] ?? []).map((reply) => ({ id: reply.key, text: reply.text, quickReplyKey: reply.key })),
    ...(replies?.custom ?? []).map((reply) => ({ id: reply.id, text: reply.text, quickReplyKey: undefined })),
  ];

  const remaining = MAX_MESSAGE_LENGTH - text.length;

  return (
    <div className="border-t bg-background">
      {chips.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto px-3 pt-2.5 pb-1 [scrollbar-width:thin]" aria-label="Quick replies">
          {chips.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() =>
                onSendText(
                  chip.quickReplyKey
                    ? { text: chip.text, quickReplyKey: chip.quickReplyKey }
                    : { text: chip.text, body: chip.text },
                )
              }
              className="shrink-0 rounded-full border bg-card px-3 py-1 text-xs font-medium transition hover:border-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {chip.text}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setManagerOpen(true)}
            className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs text-muted-foreground transition hover:bg-muted"
          >
            <Settings2 className="size-3.5" aria-hidden="true" /> Manage
          </button>
        </div>
      )}

      <form
        className="flex items-end gap-2 p-3"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <input
          ref={fileRef}
          type="file"
          accept={ALLOWED_IMAGE_TYPES.join(",")}
          multiple
          className="sr-only"
          id="chat-photo-input"
          onChange={(event) => pickImages(event.target.files)}
        />
        <label
          htmlFor="chat-photo-input"
          className="inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground focus-within:ring-3 focus-within:ring-ring/50"
          title="Send photos"
        >
          <ImagePlus className="size-5" aria-hidden="true" />
          <span className="sr-only">Send photos</span>
        </label>

        <div className="relative min-w-0 flex-1">
          <label htmlFor="chat-message-input" className="sr-only">
            Message
          </label>
          <textarea
            ref={textareaRef}
            id="chat-message-input"
            rows={1}
            value={text}
            maxLength={MAX_MESSAGE_LENGTH}
            onChange={(event) => {
              setText(event.target.value);
              if (event.target.value.trim()) onTyping();
              else onStopTyping();
            }}
            onKeyDown={handleKeyDown}
            onBlur={onStopTyping}
            placeholder="Write a message…"
            className="block max-h-40 w-full resize-none rounded-2xl border bg-muted/40 px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:bg-background focus-visible:ring-3 focus-visible:ring-ring/30"
          />
          {remaining < 200 && (
            <span
              className={cn(
                "absolute right-3 -top-5 text-[10px]",
                remaining < 50 ? "text-destructive" : "text-muted-foreground",
              )}
            >
              {remaining}
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={!text.trim()}
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:bg-primary/90 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          aria-label="Send message"
        >
          <Send className="size-4" aria-hidden="true" />
        </button>
      </form>

      <QuickReplyManager
        open={managerOpen}
        onOpenChange={setManagerOpen}
        custom={replies?.custom ?? []}
        onChange={(custom) => setReplies((current) => (current ? { ...current, custom } : current))}
      />
    </div>
  );
}
