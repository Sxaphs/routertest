"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  Copy,
  Info,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * 账户安全总览（全部 mock，TODO(backend): 接 OURBRAND 密钥风险扫描）。
 * 结构对齐参照站 /settings/security。
 */

interface RiskCard {
  id: string;
  dot: string; // 状态点颜色
  title: string;
  tip: string;
  count: number;
  footer:
    | { kind: "none" }
    | { kind: "link"; href: string };
}

// TODO(backend): 真实风险统计
const RISK_CARDS: RiskCard[] = [
  {
    id: "no-spend-limit",
    dot: "bg-emerald-500",
    title: "No spend limit",
    tip: "A leaked key could spend without a cap.",
    count: 0,
    footer: { kind: "none" },
  },
  {
    id: "never-expires",
    dot: "bg-emerald-500",
    title: "Never expires",
    tip: "Keys that stay valid until they are removed.",
    count: 0,
    footer: { kind: "none" },
  },
  {
    id: "idle",
    dot: "bg-amber-500",
    title: "Never used or idle 90+ days",
    tip: "No requests in the last 90 days.",
    count: 1,
    footer: { kind: "link", href: "/settings/security?tab=key-safety&preset=idle" },
  },
  {
    id: "safe-to-remove",
    dot: "bg-amber-500",
    title: "Safe to remove",
    tip: "Idle keys with little or no lifetime usage.",
    count: 1,
    footer: {
      kind: "link",
      href: "/settings/security?tab=key-safety&preset=safe-to-remove",
    },
  },
];

export default function SecurityPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold">Security</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Review your at-risk API keys and how this account&apos;s keys can be
        used.
      </p>

      <Tabs defaultValue="overview" className="mt-6">
        <TabsList aria-label="Security settings" variant="line">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="key-safety">Key safety</TabsTrigger>
          <TabsTrigger value="ip-allowlist">IP allowlist</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {RISK_CARDS.map((c) => (
              <div key={c.id} className="rounded-lg border p-4">
                <p className="flex items-center gap-1.5 text-sm font-medium">
                  <span className={`size-2 rounded-full ${c.dot}`} />
                  {c.title}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          aria-label={c.tip}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Info className="size-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>{c.tip}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </p>
                <p className="mt-3 text-4xl font-extrabold">{c.count}</p>
                {c.footer.kind === "none" ? (
                  <p className="mt-3 text-sm text-muted-foreground">
                    None right now
                  </p>
                ) : (
                  <Link
                    href={c.footer.href}
                    className="mt-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline"
                  >
                    View keys <ArrowRight className="size-3" />
                  </Link>
                )}
              </div>
            ))}
          </div>

          <h2 className="mt-8 text-lg font-bold">Recommendations</h2>
          <div className="mt-4 space-y-4">
            <div className="flex flex-wrap items-start gap-4 rounded-lg border p-4">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted/50 text-muted-foreground">
                <Trash2 className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium">Remove 1 unused key</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Ask each owner to confirm, then archive.
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Give the CSV to your agent and have it confirm with each
                  owner that their key is safe to remove.
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // TODO(backend): 导出真实 owner 列表
                    navigator.clipboard.writeText("user@example.com,Default key");
                  }}
                >
                  <Copy className="mr-1 size-3.5" /> Copy owner list
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/settings/security?tab=key-safety&preset=safe-to-remove">
                    View keys
                  </Link>
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-start gap-4 rounded-lg border p-4">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted/50 text-muted-foreground">
                <CalendarClock className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium">Enforce a maximum key lifetime</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Set a maximum API key lifetime in privacy settings. Requests
                  from keys that never expire or exceed it are rejected,
                  including existing keys.
                </p>
              </div>
              <Button variant="outline" size="sm" className="shrink-0" asChild>
                <Link href="/settings/privacy">Open privacy settings</Link>
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="key-safety" className="mt-6">
          {/* TODO(backend): 密钥安全明细表 */}
          <div className="flex h-32 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
            Key safety details will appear here（TODO(backend)）
          </div>
        </TabsContent>
        <TabsContent value="ip-allowlist" className="mt-6">
          {/* TODO(backend): IP 白名单配置 */}
          <div className="flex h-32 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
            IP allowlist configuration will appear here（TODO(backend)）
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
