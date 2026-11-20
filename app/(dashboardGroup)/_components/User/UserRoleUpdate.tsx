"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";
import Swal from "sweetalert2";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CREATABLE_ROLES, ROLE_LABEL } from "@/lib/enum";
import { Role } from "@/types";
import { updateUserRoleAction } from "../../_actions/userActions";

/*
 * Super admin only (PATCH /users/:id/role).
 */
const UserRoleUpdate = ({
  userId,
  userName,
  currentRole,
}: {
  userId: string;
  userName: string;
  currentRole: Role;
}) => {
  const router = useRouter();
  const [role, setRole] = useState<Role>(currentRole);
  const [isPending, startTransition] = useTransition();

  const assignableRoles = CREATABLE_ROLES.SUPER_ADMIN ?? [];

  const handleSave = async () => {
    const confirmation = await Swal.fire({
      title: "Change role?",
      text: `${userName} will become ${ROLE_LABEL[role]} and must sign in again.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, change role",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!confirmation.isConfirmed) return;

    startTransition(async () => {
      const result = await updateUserRoleAction(userId, role);

      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
        setRole(currentRole);
      }
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={role} onValueChange={(value) => value && setRole(value as Role)}>
        <SelectTrigger className="w-44" aria-label="New role">
          <SelectValue>{ROLE_LABEL[role]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {!assignableRoles.includes(currentRole) && (
            <SelectItem value={currentRole} disabled>
              {ROLE_LABEL[currentRole]}
            </SelectItem>
          )}
          {assignableRoles.map((item) => (
            <SelectItem key={item} value={item}>
              {ROLE_LABEL[item]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        type="button"
        onClick={handleSave}
        disabled={isPending || role === currentRole}
      >
        {isPending ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
        Save role
      </Button>
    </div>
  );
};

export default UserRoleUpdate;
