"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLE_LABEL, USER_STATUS_LABEL } from "@/lib/enum";
import { Role, UserStatus } from "@/types";

const ALL = "ALL";

/*
 * Role / status / deleted filters, stored in the URL like SearchBar and CustomPagination.
 */
export function UserFilters() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const role = searchParams.get("role") ?? ALL;
  const status = searchParams.get("status") ?? ALL;
  const isDeleted = searchParams.get("isDeleted") === "true" ? "true" : "false";

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (!value || value === ALL || (key === "isDeleted" && value === "false")) {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    params.delete("page");

    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={role} onValueChange={(value) => updateParam("role", value)}>
        <SelectTrigger className="w-40" aria-label="Filter by role">
          <SelectValue>{role === ALL ? "All roles" : ROLE_LABEL[role as Role]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All roles</SelectItem>
          {(Object.keys(ROLE_LABEL) as Role[]).map((item) => (
            <SelectItem key={item} value={item}>
              {ROLE_LABEL[item]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={status} onValueChange={(value) => updateParam("status", value)}>
        <SelectTrigger className="w-36" aria-label="Filter by status">
          <SelectValue>
            {status === ALL ? "All statuses" : USER_STATUS_LABEL[status as UserStatus]}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All statuses</SelectItem>
          {(Object.keys(USER_STATUS_LABEL) as UserStatus[]).map((item) => (
            <SelectItem key={item} value={item}>
              {USER_STATUS_LABEL[item]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={isDeleted} onValueChange={(value) => updateParam("isDeleted", value)}>
        <SelectTrigger className="w-36" aria-label="Show deleted users">
          <SelectValue>{isDeleted === "true" ? "Deleted users" : "Active users"}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="false">Active users</SelectItem>
          <SelectItem value="true">Deleted users</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
