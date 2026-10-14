"use client";

import { useState } from "react";
import Link from "next/link";
import { Camera, ExternalLink, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * 账户 Profile 总览（全部 mock，TODO(backend): 接 OURBRAND 账户/用量统计）。
 * 结构对齐参照站 /settings/profile。
 */

// TODO(backend): 真实用户档案
const USER = {
  initials: "DU",
  name: "Demo User",
  email: "user@example.com",
};

// TODO(backend): 近 7 天每日用量
const DAY_LABELS = ["10/7", "10/8", "10/9", "10/10", "10/11", "10/12", "10/13"];

// TODO(backend): 年度活跃热力图（月标签 + 35 列占位格子）
const HEAT_MONTHS = [
  "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep",
];

// TODO(backend): 账户下 API keys
const PROFILE_KEYS = [
  {
    id: "k1",
    name: "Default key",
    preview: "sk-ob-v1-807...c31",
    workspace: "Default Workspace",
    created: "14 hours ago",
  },
];

function InfoTip({ label }: { label: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button aria-label="Information" className="text-muted-foreground hover:text-foreground">
            <Info className="size-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function ProfilePage() {
  const [range, setRange] = useState("7d");
  const [metric, setMetric] = useState("spend");

  const metricValue = metric === "spend" ? "$0.00" : "0"; // TODO(backend)

  return (
    <div className="max-w-5xl">
      {/* 用户卡片 */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="flex size-14 items-center justify-center rounded-lg bg-muted text-lg font-bold text-muted-foreground">
            {USER.initials}
          </div>
          <button
            aria-label="Change profile picture"
            className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full border bg-background text-muted-foreground hover:text-foreground"
            onClick={() => alert("头像上传尚未接入（TODO(backend)）")}
          >
            <Camera className="size-3" />
          </button>
        </div>
        <div>
          <h1 className="text-xl font-bold">{USER.name}</h1>
          <p className="text-sm text-muted-foreground">{USER.email}</p>
        </div>
      </div>

      {/* Usage summary */}
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <h3 className="text-lg font-bold">Usage summary</h3>
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
        <Tabs value={metric} onValueChange={setMetric}>
          <TabsList>
            <TabsTrigger value="tokens">Tokens</TabsTrigger>
            <TabsTrigger value="spend">Spend</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
          </TabsList>
        </Tabs>
        <Link
          href="/activity?date_preset=past_1_week"
          className="ml-auto flex items-center gap-1 text-sm text-muted-foreground hover:underline"
        >
          View full activity <ExternalLink className="size-3" />
        </Link>
      </div>

      <div className="mt-4 grid gap-6 md:grid-cols-[2fr_1fr]">
        <div>
          <p className="text-4xl font-extrabold">{metricValue}</p>
          <p className="mt-1 text-sm text-muted-foreground">No prior data</p>
          <div className="mt-4 rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Daily by model</p>
            <div className="mt-4 flex h-32 items-end justify-between gap-2">
              {DAY_LABELS.map((d) => (
                <div key={d} className="flex flex-1 flex-col items-center gap-2">
                  <div className="h-full w-full rounded-sm bg-muted/40" />
                  <span className="text-xs text-muted-foreground">{d}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-bold">
            Top models{" "}
            <span className="text-sm font-normal text-muted-foreground">by spend</span>
          </h3>
          <p className="mt-4 text-sm text-muted-foreground">No usage in this period</p>
        </div>
      </div>

      {/* Activity */}
      <div className="mt-10 flex items-center gap-1">
        <h3 className="text-lg font-bold">Activity</h3>
        <InfoTip label="Daily spend over the past year" />
        <span className="ml-auto text-sm text-muted-foreground">Spend</span>
      </div>
      <div className="mt-4 rounded-lg border p-4">
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <dt className="text-sm text-muted-foreground">Longest streak</dt>
            <dd className="mt-1 text-xl font-bold">0 days</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Avg / day</dt>
            <dd className="mt-1 text-xl font-bold">$0</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Avg / week</dt>
            <dd className="mt-1 text-xl font-bold">$0</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Total</dt>
            <dd className="mt-1 text-xl font-bold">$0</dd>
          </div>
        </dl>
        <div className="mt-6 overflow-x-auto">
          <div className="grid min-w-[640px] grid-cols-16 gap-1 text-xs text-muted-foreground">
            {HEAT_MONTHS.map((m, i) => (
              <span key={`${m}-${i}`} className="text-center">{m}</span>
            ))}
          </div>
          <div className="mt-1 flex min-w-[640px] gap-2">
            <div className="flex flex-col justify-between py-0.5 text-xs text-muted-foreground">
              <span>M</span>
              <span>W</span>
              <span>F</span>
            </div>
            <div className="grid flex-1 grid-cols-16 gap-1">
              {Array.from({ length: 16 * 7 }).map((_, i) => (
                <div
                  key={i}
                  className={
                    "aspect-square rounded-[2px] " +
                    (i % 11 === 0 ? "bg-muted" : "bg-muted/40")
                  }
                />
              ))}
            </div>
          </div>
          <div className="mt-2 flex min-w-[640px] items-center justify-end gap-1 text-xs text-muted-foreground">
            Less
            <span className="size-2.5 rounded-[2px] bg-muted/40" />
            <span className="size-2.5 rounded-[2px] bg-muted" />
            <span className="size-2.5 rounded-[2px] bg-primary/40" />
            <span className="size-2.5 rounded-[2px] bg-primary/70" />
            <span className="size-2.5 rounded-[2px] bg-primary" />
            More
          </div>
        </div>
      </div>

      {/* API keys */}
      <div className="mt-10 flex items-center gap-2">
        <h3 className="text-lg font-bold">API keys</h3>
        <span className="text-sm text-muted-foreground">1</span>
      </div>
      <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border p-4">
          <dt className="text-sm text-muted-foreground">Active keys</dt>
          <dd className="mt-1 text-xl font-bold">1</dd>
        </div>
        <div className="rounded-lg border p-4">
          <dt className="text-sm text-muted-foreground">Disabled / expired</dt>
          <dd className="mt-1 text-xl font-bold">0</dd>
        </div>
        <div className="rounded-lg border p-4">
          <dt className="text-sm text-muted-foreground">Last created</dt>
          <dd className="mt-1 text-xl font-bold">14 hours ago</dd>
          <dd className="text-xs text-muted-foreground">Oct 13, 2026</dd>
        </div>
      </dl>
      <div className="mt-4 overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              {["Name", "Key", "Workspace", "Created"].map((h) => (
                <th key={h} className="p-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PROFILE_KEYS.map((k) => (
              <tr key={k.id} className="border-b last:border-0">
                <td className="p-3 font-medium">{k.name}</td>
                <td className="p-3 font-mono text-xs text-muted-foreground">{k.preview}</td>
                <td className="p-3 text-muted-foreground">{k.workspace}</td>
                <td className="p-3 text-muted-foreground">{k.created}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
