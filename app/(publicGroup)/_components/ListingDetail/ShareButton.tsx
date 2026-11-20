"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/*
 * Native share sheet on phones, copy-link fallback on desktop.
 */
export function ShareButton({ title, path }: { title: string; path: string }) {
  const handleShare = async () => {
    const url = `${window.location.origin}${path}`;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // cancelled — fall through to copy
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy the link");
    }
  };

  return (
    <Button type="button" variant="outline" onClick={handleShare}>
      <Share2 /> Share
    </Button>
  );
}
