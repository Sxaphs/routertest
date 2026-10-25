"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck, Store, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROLE_STORAGE, type Role } from "@/mocks/distribution";

/**
 * 视角切换器（普通用户 / 分销商 / 平台运营 admin），状态存 localStorage。
 * TODO(backend): 角色应来自 GET /v1/auth/session 的 claim，这里仅做产品演示。
 * 分销商视角下通过 <DistributionNavLink/> 露出"分销中心"入口；
 * admin 视角下通过 <AdminNavLink/> 露出运营后台入口。
 */

const ROLE_LABELS: Record<Role, string> = {
  user: "User",
  distributor: "Distributor",
  admin: "Admin",
};

function readStoredRole(): Role {
  const v = localStorage.getItem(ROLE_STORAGE);
  return v === "distributor" || v === "admin" ? v : "user";
}

export function useRole(): [Role, (r: Role) => void] {
  const [role, setRole] = useState<Role>("user");
  useEffect(() => {
    const read = () => setRole(readStoredRole());
    read();
    window.addEventListener("role-changed", read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener("role-changed", read);
      window.removeEventListener("storage", read);
    };
  }, []);
  const set = (r: Role) => {
    localStorage.setItem(ROLE_STORAGE, r);
    window.dispatchEvent(new Event("role-changed"));
    setRole(r);
  };
  return [role, set];
}

export function RoleSwitcher() {
  const [role, setRole] = useRole();
  const Icon = role === "distributor" ? Store : role === "admin" ? ShieldCheck : User;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" aria-label="Switch perspective">
          <Icon className="mr-1 size-4" />
          {ROLE_LABELS[role]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setRole("user")}>
          <User className="mr-2 size-4" /> End user
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setRole("distributor")}>
          <Store className="mr-2 size-4" /> Distributor
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setRole("admin")}>
          <ShieldCheck className="mr-2 size-4" /> Admin
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** 分销商视角下才渲染的"分销中心"导航入口 */
export function DistributionNavLink() {
  const [role] = useRole();
  if (role !== "distributor") return null;
  return (
    <Button variant="ghost" asChild>
      <Link href="/distribution">Distribution</Link>
    </Button>
  );
}

/** admin 视角下才渲染的运营后台导航入口 */
export function AdminNavLink() {
  const [role] = useRole();
  if (role !== "admin") return null;
  return (
    <Button variant="ghost" asChild>
      <Link href="/admin/reviews">Admin</Link>
    </Button>
  );
}
