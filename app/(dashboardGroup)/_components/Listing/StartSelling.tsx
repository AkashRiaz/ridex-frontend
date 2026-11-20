"use client";

import { useTransition } from "react";
import { Bike, Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { becomeSellerAction } from "../../_actions/profileActions";

/*
 * Buyer → seller in one click (POST /users/me/become-seller).
 */
const StartSelling = () => {
  const [isPending, startTransition] = useTransition();

  const handleClick = async () => {
    const confirmation = await Swal.fire({
      title: "Start selling?",
      text: "Your account becomes a seller account. You can still browse and buy as before.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, let me sell",
      cancelButtonText: "Not now",
      reverseButtons: true,
    });

    if (!confirmation.isConfirmed) return;

    startTransition(async () => {
      // redirects to the listing wizard on success
      const result = await becomeSellerAction();
      if (!result.success) toast.error(result.message);
    });
  };

  return (
    <section className="flex flex-col gap-4 rounded-2xl border bg-gradient-to-br from-primary/10 to-transparent p-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Bike className="size-6" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Have a bike to sell?</h2>
          <p className="text-sm text-muted-foreground">
            Post it in minutes. Specs fill in automatically from the model.
          </p>
        </div>
      </div>
      <Button type="button" onClick={handleClick} disabled={isPending} className="shrink-0">
        {isPending && <Loader2 className="animate-spin" />}
        Start selling
      </Button>
    </section>
  );
};

export default StartSelling;
