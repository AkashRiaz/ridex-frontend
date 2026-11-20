"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { TActionState } from "@/types";
import { deleteBrandAction } from "../../_actions/brandActions";
import { deleteVehicleModelAction } from "../../_actions/vehicleModelActions";
import { deleteVehicleTypeAction } from "../../_actions/vehicleTypeActions";

const DELETE_ACTIONS: Record<
  "vehicleType" | "brand" | "vehicleModel",
  { action: (id: string) => Promise<TActionState>; noun: string }
> = {
  vehicleType: { action: deleteVehicleTypeAction, noun: "vehicle type" },
  brand: { action: deleteBrandAction, noun: "brand" },
  vehicleModel: { action: deleteVehicleModelAction, noun: "model" },
};

/*
 * Shared delete button for VehicleType / Brand / VehicleModel rows
 * (reference <Entity>Delete pattern: Swal confirm → action → toast → refresh).
 */
const CatalogDelete = ({
  entity,
  id,
  name,
  showLabel = false,
  redirectTo,
}: {
  entity: keyof typeof DELETE_ACTIONS;
  id: string;
  name: string;
  showLabel?: boolean;
  redirectTo?: string;
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { action, noun } = DELETE_ACTIONS[entity];

  const handleDelete = async () => {
    const confirmation = await Swal.fire({
      title: `Delete ${noun}?`,
      text: `You are about to delete ${name}. This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      reverseButtons: true,
    });

    if (!confirmation.isConfirmed) return;

    startTransition(async () => {
      const result = await action(id);

      if (result.success) {
        toast.success(result.message);
        if (redirectTo) router.push(redirectTo);
        router.refresh();
      } else toast.error(result.message);
    });
  };

  return (
    <Button
      type="button"
      variant="destructive"
      size={showLabel ? "default" : "icon-sm"}
      onClick={handleDelete}
      disabled={isPending}
      aria-label={`Delete ${name}`}
      title={`Delete ${name}`}
    >
      {isPending ? <Loader2 className="animate-spin" /> : <Trash2 />}
      {showLabel && "Delete"}
    </Button>
  );
};

export default CatalogDelete;
