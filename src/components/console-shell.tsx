"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { brand } from "@/config/brand";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { PromoBanner } from "@/components/promo-banner";
import { FuseBanner } from "@/components/fuse-banner";
import { SearchPalette } from "@/components/search-palette";
import { AdminNavLink, DistributionNavLink, RoleSwitcher } from "@/components/role-switcher";
import { cn } from "@/lib/utils";

/**
 * 控制台外壳（登录后页面）。参照站登录后：账户/工作区切换器 + 控制台导航 +
 * 左侧分组侧栏。当前无认证，全部按"已登录 mock"渲染（TODO(backend)）。
 */

const CONSOLE_NAV = [
  { href: "/settings/preferences", label: "Dashboard" },
  { href: "/models", label: "Models" },
  { href: "/chat", label: "Chat" },
  { href: "/rankings", label: "Rankings" },
] as const;

const ACCOUNT_ITEMS = [
  { href: "/workspaces", label: "Workspaces" },
  { href: "/settings/profile", label: "Profile" },
  { href: "/activity", label: "Activity" },
  { href: "/logs", label: "Logs" },
  { href: "/settings/credits", label: "Credits" },
  { href: "/settings/keys", label: "API Keys" },
  { href: "/settings/protection", label: "Protection" },
  { href: "/settings/management-keys", label: "Management Keys" },
  { href: "/settings/notifications", label: "Notifications" },
  { href: "/settings/privacy", label: "Privacy" },
  { href: "/settings/security", label: "Security" },
  { href: "/settings/preferences", label: "Preferences" },
] as const;

const WORKSPACE_ITEMS = [
  { href: "/workspaces/default", label: "Overview" },
  { href: "/activity", label: "Activity" },
  { href: "/workspaces/default/logs", label: "Logs" },
  { href: "/settings/keys", label: "API Keys" },
  { href: "/workspaces/default/files", label: "Files", beta: true },
  { href: "/workspaces/default/guardrails", label: "Guardrails" },
  { href: "/workspaces/default/byok", label: "BYOK" },
  { href: "/workspaces/default/routing", label: "Routing" },
  { href: "/workspaces/default/presets", label: "Presets" },
  { href: "/workspaces/default/tools", label: "Tools" },
  { href: "/workspaces/default/observability", label: "Observability" },
  { href: "/workspaces/default/classifiers", label: "Classifiers", beta: true },
  { href: "/workspaces/default/settings", label: "Settings" },
] as const;

const DISTRIBUTION_ITEMS = [
  { href: "/distribution", label: "Overview" },
  { href: "/distribution/users", label: "End Users" },
  { href: "/distribution/pricing", label: "Pricing" },
  { href: "/distribution/settlement", label: "Settlement" },
  { href: "/distribution/whitelabel", label: "White Label" },
] as const;

export function ConsoleShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // 侧栏变体：分销中心 / 工作区（含 /settings/keys）/ 账户
  const sidebar = pathname.startsWith("/distribution")
    ? "distribution"
    : pathname.startsWith("/settings/keys") || pathname.startsWith("/workspaces/default")
      ? "workspace"
      : "account";
  const items =
    sidebar === "distribution"
      ? DISTRIBUTION_ITEMS
      : sidebar === "workspace"
        ? WORKSPACE_ITEMS
        : ACCOUNT_ITEMS;
  const sidebarTitle =
    sidebar === "distribution" ? "Distribution" : sidebar === "account" ? "Account" : "Workspace";

  return (
    <div className="flex min-h-full flex-col">
      {/* 控制台顶栏 */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur">
        <div
          className="mx-auto flex items-center gap-4 px-4 lg:px-6"
          style={{ height: "var(--navbar-height)" }}
        >
          {/* 账户/工作区切换器（mock） */}
          <button className="flex items-center gap-2 font-semibold">
            <span
              aria-hidden
              className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm"
            >
              {brand.logoMark}
            </span>
            Personal
          </button>
          <span className="text-muted-foreground">/</span>
          <button className="text-muted-foreground hover:text-foreground">
            Default Workspace
          </button>

          {/* ⌘K 全局搜索面板 */}
          <SearchPalette />

          <nav className="ml-auto hidden items-center gap-1 md:flex">
            {CONSOLE_NAV.map((item) => (
              <Button key={item.label} variant="ghost" asChild>
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ))}
            <DistributionNavLink />
            <AdminNavLink />
          </nav>
          <RoleSwitcher />
          <ThemeToggle />
          <Button variant="ghost" asChild>
            <Link href="/">Sign out</Link>
          </Button>
        </div>
      </header>
      <PromoBanner />
      <FuseBanner />

      <div className="mx-auto flex w-full max-w-[1400px] flex-1">
        {/* 侧栏 */}
        <aside className="hidden w-52 shrink-0 border-r px-3 py-6 lg:block">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {sidebarTitle}
          </p>
          <ul className="space-y-0.5">
            {items.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm",
                      active
                        ? "bg-accent font-medium text-accent-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {item.label}
                    {"beta" in item && item.beta && (
                      <span className="rounded bg-primary/15 px-1 text-[10px] font-semibold text-primary">
                        Beta
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </aside>
        <main id="skip" className="min-w-0 flex-1 px-4 py-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
