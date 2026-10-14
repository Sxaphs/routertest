"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeftRight,
  BarChart3,
  ChevronRight,
  Eye,
  KeyRound,
  Server,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Wrench,
  X,
} from "lucide-react";
import { brand } from "@/config/brand";
import { Card, CardContent } from "@/components/ui/card";

/**
 * 工作区 Overview（全部 mock，TODO(backend): 接 OURBRAND 工作区用量/配置）。
 * 结构对齐参照站 /workspaces/default。
 */

const FEATURE_CARDS = [
  {
    href: "/workspaces/default/keys",
    icon: KeyRound,
    title: "API Keys",
    desc: "Create and manage API keys in this workspace.",
  },
  {
    href: "/workspaces/default/guardrails",
    icon: ShieldCheck,
    title: "Guardrails",
    desc: "Set budgets, model/provider restrictions, privacy, and content policies.",
  },
  {
    href: "/workspaces/default/byok",
    icon: Server,
    title: "BYOK",
    desc: `Use your own provider API keys on ${brand.name}.`,
  },
  {
    href: "/workspaces/default/routing",
    icon: ArrowLeftRight,
    title: "Routing",
    desc: "Set routing policies for models and providers.",
  },
  {
    href: "/workspaces/default/presets",
    icon: SlidersHorizontal,
    title: "Presets",
    desc: "Save shortcuts for system prompts and request parameters.",
  },
  {
    href: "/workspaces/default/tools",
    icon: Wrench,
    title: "Tools",
    desc: "Configure plugins and control which server tools requests may use.",
  },
  {
    href: "/workspaces/default/observability",
    icon: Eye,
    title: "Observability",
    desc: "Connect monitoring tools like Langfuse or Datadog to track usage.",
  },
  {
    href: "/workspaces/default/settings",
    icon: Settings,
    title: "Settings",
    desc: "Edit the workspace name and description.",
  },
];

const WEEK_STATS = [
  "No spend this week",
  "No requests this week",
  "No tokens this week",
];

export default function WorkspaceOverviewPage() {
  const [bannerVisible, setBannerVisible] = useState(true);

  return (
    <div>
      <h1 className="text-2xl font-bold">Default Workspace</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        We created this workspace for you with all your existing API keys,
        routing rules, privacy settings, guardrails, and configurations.
      </p>

      {bannerVisible && (
        <div className="relative mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/40">
          <h2 className="text-sm font-semibold">Introducing Workspaces!</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Organize your {brand.name} usage into different environments with
            separate keys, configurations, budgets, and rules.
          </p>
          <button
            aria-label="Dismiss"
            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
            onClick={() => setBannerVisible(false)}
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      <div className="mt-8 flex items-center justify-between">
        <h3 className="text-lg font-bold">This Week&apos;s Usage</h3>
        {/* TODO(backend): 带真实 workspace_id 跳转 */}
        <Link
          href="/activity"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          View Activity <ChevronRight className="size-4" />
        </Link>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {/* TODO(backend): 真实周用量数据 */}
        {WEEK_STATS.map((label) => (
          <Card key={label}>
            <CardContent className="flex flex-col items-center gap-2 py-8">
              <BarChart3 className="size-8 text-muted-foreground/40" />
              <p className="font-medium">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {FEATURE_CARDS.map((c) => (
          <Link key={c.href} href={c.href}>
            <Card className="h-full transition-colors hover:bg-muted/50">
              <CardContent className="flex items-center gap-3 py-4">
                <c.icon className="size-5 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{c.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {c.desc}
                  </p>
                </div>
                <ChevronRight className="ml-auto size-4 shrink-0 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
