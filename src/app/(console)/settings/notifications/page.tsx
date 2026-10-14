"use client";

import { useState } from "react";
import {
  Bell,
  BellOff,
  Building2,
  ChevronRight,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

/**
 * 通知设置（全部内存 mock，TODO(backend): 接 OURBRAND 通知偏好/告警投递）。
 * 结构对齐参照站 /settings/notifications。
 */

interface AlertDef {
  id: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}

function AlertRow({
  def,
  enabled,
  onToggle,
}: {
  def: AlertDef;
  enabled: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 border-b px-4 py-4 last:border-0">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted/50 text-muted-foreground">
        {def.icon}
      </div>
      <button
        className="min-w-0 flex-1 text-left"
        onClick={() => alert("告警配置尚未接入（TODO(backend)）")}
        aria-label={`Configure ${def.title}`}
      >
        <p className="font-medium">{def.title}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{def.desc}</p>
      </button>
      <Switch
        checked={enabled}
        onCheckedChange={onToggle}
        aria-label={`Enable ${def.title}`}
      />
      <button
        aria-label={`Configure ${def.title}`}
        className="text-muted-foreground hover:text-foreground"
        onClick={() => alert("告警配置尚未接入（TODO(backend)）")}
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}

function Section({
  icon,
  title,
  desc,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-4 border-t py-6 md:grid-cols-[240px_1fr] md:gap-8">
      <div>
        <h2 className="flex items-center gap-2 font-semibold">
          <span className="text-muted-foreground">{icon}</span>
          {title}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      </div>
      <div>{children}</div>
    </section>
  );
}

export default function NotificationsPage() {
  // TODO(backend): 真实通知偏好
  const [lowBalance, setLowBalance] = useState(false);
  const [deprecation, setDeprecation] = useState(false);
  const [priceDrop, setPriceDrop] = useState(false);

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold">Notifications</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Choose which events notify you and how they’re delivered.
      </p>

      <Section
        icon={<Wallet className="size-4" />}
        title="Budget & Spend"
        desc="Stay ahead of credit burn."
      >
        <div className="rounded-lg border">
          <AlertRow
            def={{
              id: "low-balance",
              icon: <Wallet className="size-4" />,
              title: "Low balance alert",
              desc: "Below $100 · Email → user@example.com",
            }}
            enabled={lowBalance}
            onToggle={setLowBalance}
          />
        </div>
      </Section>

      <Section
        icon={<Bell className="size-4" />}
        title="Models"
        desc="Keep your integrations current when models change or drop in price."
      >
        <div className="rounded-lg border">
          <AlertRow
            def={{
              id: "deprecation",
              icon: <BellOff className="size-4" />,
              title: "Model deprecation alert",
              desc: "Email → You",
            }}
            enabled={deprecation}
            onToggle={setDeprecation}
          />
          <AlertRow
            def={{
              id: "price-drop",
              icon: <TrendingDown className="size-4" />,
              title: "Model price drop alert",
              desc: "Email → You",
            }}
            enabled={priceDrop}
            onToggle={setPriceDrop}
          />
        </div>
      </Section>

      <Section
        icon={<Building2 className="size-4" />}
        title="Delivery destinations"
        desc="Route alerts to Slack or your own webhook endpoint, and add budget alerts for each workspace."
      >
        <div className="flex items-center gap-3 rounded-lg border px-4 py-4">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted/50 text-muted-foreground">
            <Building2 className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
              Business
            </Badge>
            <p className="mt-1 text-sm text-muted-foreground">
              Available on Business and Enterprise plans: budget alerts plus
              Slack and custom webhook delivery.
            </p>
          </div>
          <Button
            className="shrink-0"
            onClick={() => alert("套餐升级尚未接入（TODO(backend)）")}
          >
            Upgrade to Business
          </Button>
        </div>
      </Section>
    </div>
  );
}
