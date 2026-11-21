"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { IQuickReplies } from "@/types";
import { createQuickReplyAction, deleteQuickReplyAction } from "../../_actions/quickReplyActions";

type TCustomReply = IQuickReplies["custom"][number];

const MAX_CUSTOM = 10;
const MAX_LENGTH = 300;

/*
 * Add or remove your own quick replies (built-in ones are fixed).
 */
export function QuickReplyManager({
  open,
  onOpenChange,
  custom,
  onChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  custom: TCustomReply[];
  onChange: (custom: TCustomReply[]) => void;
}) {
  const [text, setText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const add = () => {
    const value = text.trim();
    if (!value) return;

    startTransition(async () => {
      const result = await createQuickReplyAction(value);

      if (result.success && result.data) {
        onChange([...custom, result.data]);
        setText("");
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  const remove = async (id: string) => {
    setDeletingId(id);
    const result = await deleteQuickReplyAction(id);
    setDeletingId(null);

    if (result.success) {
      onChange(custom.filter((reply) => reply.id !== id));
    } else {
      toast.error(result.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Your quick replies</DialogTitle>
          <DialogDescription>
            Save up to {MAX_CUSTOM} replies you send often. They appear above the message box.
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            add();
          }}
        >
          <label htmlFor="quick-reply-text" className="sr-only">
            New quick reply
          </label>
          <Input
            id="quick-reply-text"
            value={text}
            maxLength={MAX_LENGTH}
            onChange={(event) => setText(event.target.value)}
            placeholder="e.g. I can deliver within Dhaka"
            disabled={isPending || custom.length >= MAX_CUSTOM}
          />
          <Button type="submit" disabled={isPending || !text.trim() || custom.length >= MAX_CUSTOM}>
            {isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Plus className="size-4" aria-hidden="true" />}
            Add
          </Button>
        </form>

        {custom.length === 0 ? (
          <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
            No saved replies yet.
          </p>
        ) : (
          <ul className="max-h-72 divide-y overflow-y-auto rounded-lg border">
            {custom.map((reply) => (
              <li key={reply.id} className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
                <span className="min-w-0 break-words">{reply.text}</span>
                <button
                  type="button"
                  onClick={() => remove(reply.id)}
                  disabled={deletingId === reply.id}
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                  aria-label={`Delete quick reply: ${reply.text}`}
                >
                  {deletingId === reply.id ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Trash2 className="size-4" aria-hidden="true" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
