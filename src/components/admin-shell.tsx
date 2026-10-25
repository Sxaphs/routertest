"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ClipboardCheck,
  Gauge,
  Scale,
  ScrollText,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { brand } from "@/config/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { useRole } from "@/components/role-switcher";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * 运营后台外壳：深色侧边导航（运营工具，无营销感），内容区跟随亮/暗主题。
 * 含 RBAC 门：非 admin 视角访问 /admin/* 时重定向 /settings。
 * TODO(backend): 正式版角色来自 GET /v1/auth/session 的 claim，门应放服务端中间件。
 */

const ADMIN_NAV = [
  { href: "/admin/reviews", label: "Review Queue", icon: ClipboardCheck },
  { href: "/admin/reconciliation", label: "Reconciliation", icon: Scale },
  { href: "/admin/overview", label: "Ops Overview", icon: Gauge },
  { href: "/admin/disputes", label: "Disputes", icon: TriangleAlert },
  { href: "/admin/audit", label: "Audit Log", icon: ScrollText },
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [role] = useRole();
  // 挂载前不渲染（角色存 localStorage，SSR 不可知），避免 hydration 闪烁
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mounted && role !== "admin") router.replace("/settings");
  }, [mounted, role, router]);

  if (!mounted || role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* 深色侧栏（亮/暗主题下都保持深色） */}
      <aside className="flex w-56 shrink-0 flex-col bg-zinc-950 text-zinc-300">
        <div className="flex h-14 items-center gap-2 border-b border-zinc-800 px-4">
          <span
            aria-hidden
            className="flex size-6 items-center justify-center rounded-md bg-primary text-sm text-primary-foreground"
          >
            {brand.logoMark}
          </span>
          <span className="font-semibold text-zinc-100">{brand.name} Admin</span>
        </div>
        <nav className="flex-1 px-2 py-4">
          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Operations
          </p>
          <ul className="space-y-0.5">
            {ADMIN_NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm",
                      active
                        ? "bg-zinc-800 font-medium text-zinc-100"
                        : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200",
                    )}
                  >
                    <item.icon className="size-4" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="border-t border-zinc-800 p-3 text-xs text-zinc-500">
          <p className="flex items-center gap-1.5">
            <ShieldCheck className="size-3.5" /> Internal tool — mock data
          </p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b px-4 lg:px-6">
          <p className="text-sm text-muted-foreground">
            Risk review, reconciliation &amp; funds operations
          </p>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Link
              href="/settings"
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              Exit admin →
            </Link>
          </div>
        </header>
        <main className="min-w-0 flex-1 px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
