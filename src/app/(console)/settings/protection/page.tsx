"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Flame, Info, Snowflake, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DEFAULT_PROTECTION,
  FUSE_STORAGE,
  MOCK_FUSE_EVENTS,
  SENSITIVITY_COPY,
  type FuseEvent,
  type ProtectionSettings,
} from "@/mocks/protection";

/**
 * 费用保险丝（/settings/protection）：Budget limits + Loop detection + Alert channels + Trigger history。
 * 全部内存 mock，TODO(backend): 接真实防护配置与触发流。
 */
export default function ProtectionPage() {
  const [s, setS] = useState<ProtectionSettings>(DEFAULT_PROTECTION);
  const [events, setEvents] = useState<FuseEvent[]>(MOCK_FUSE_EVENTS);

  const set = <K extends keyof ProtectionSettings>(k: K, v: ProtectionSettings[K]) =>
    setS((prev) => ({ ...prev, [k]: v }));

  const unfreeze = (id: string) => {
    // TODO(backend): 解冻真实熔断
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, resolved: true } : e)));
    if (typeof window !== "undefined") {
      localStorage.removeItem(FUSE_STORAGE.triggered);
      window.dispatchEvent(new Event("fuse-state-changed"));
    }
  };

  /** 演示用：模拟一次熔断，全局横幅随即出现 */
  const simulateFuse = () => {
    localStorage.setItem(
      FUSE_STORAGE.triggered,
      JSON.stringify({
        reason: "Monthly budget of $200 exhausted (demo)",
        keyName: "Default key",
        time: "Oct 14, 2026, 3:00 PM UTC",
      }),
    );
    localStorage.removeItem(FUSE_STORAGE.dismissed);
    window.dispatchEvent(new Event("fuse-state-changed"));
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Flame className="size-6 text-primary" />
            Spend Protection
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            The last line of defense against runaway spend and request loops. When it trips, everything stops — no surprise bills.
          </p>
        </div>
        <Switch
          checked={s.enabled}
          onCheckedChange={(v) => set("enabled", v)}
          aria-label="Master switch"
        />
      </div>

      <fieldset disabled={!s.enabled} className="space-y-6 disabled:opacity-50">
        {/* Budget limits */}
        <Card className="mt-6">
          <CardContent className="space-y-4 pt-6">
            <h2 className="font-semibold">Budget limits</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm" htmlFor="budget-monthly">
                  Monthly budget (USD)
                </label>
                <Input
                  id="budget-monthly"
                  inputMode="decimal"
                  value={s.monthlyBudget ?? ""}
                  onChange={(e) =>
                    set("monthlyBudget", Number(e.target.value) || null)
                  }
                />
              </div>
              <div>
                <label className="text-sm" htmlFor="budget-daily">
                  Daily budget (USD)
                </label>
                <Input
                  id="budget-daily"
                  inputMode="decimal"
                  value={s.dailyBudget ?? ""}
                  onChange={(e) =>
                    set("dailyBudget", Number(e.target.value) || null)
                  }
                />
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm">Overspend policy</p>
              <RadioGroup
                value={s.overspendPolicy}
                onValueChange={(v) =>
                  set("overspendPolicy", v as ProtectionSettings["overspendPolicy"])
                }
              >
                <label className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value="alert_only" id="p-alert" />
                  Alert only: keep serving requests and notify me
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value="auto_fuse" id="p-fuse" />
                  Auto-fuse: pause all API calls until manually unfrozen
                </label>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        {/* Loop detection */}
        <Card>
          <CardContent className="space-y-3 pt-6">
            <h2 className="flex items-center gap-1 font-semibold">
              Loop detection
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="size-3.5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-72">
                    Detects high-frequency repeats of the same request — the most common source of runaway bills.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </h2>
            <RadioGroup
              value={s.loopSensitivity}
              onValueChange={(v) =>
                set("loopSensitivity", v as ProtectionSettings["loopSensitivity"])
              }
            >
              {(["low", "medium", "high"] as const).map((lv) => (
                <label key={lv} className="flex items-start gap-2 text-sm">
                  <RadioGroupItem value={lv} id={`s-${lv}`} className="mt-0.5" />
                  <span>{SENSITIVITY_COPY[lv]}</span>
                </label>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Alert channels */}
        <Card>
          <CardContent className="space-y-3 pt-6">
            <h2 className="font-semibold">Alert channels</h2>
            {(
              [
                ["email", "Email", "Sent to your account email"],
                ["webhook", "Webhook", "POST to your endpoint"],
                ["wechat", "WeChat", "Push via a WeCom bot"],
              ] as const
            ).map(([key, label, desc]) => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={s.channels[key]}
                  onCheckedChange={(v) =>
                    set("channels", { ...s.channels, [key]: !!v })
                  }
                />
                <span className="font-medium">{label}</span>
                <span className="text-muted-foreground">{desc}</span>
              </label>
            ))}
          </CardContent>
        </Card>
      </fieldset>

      {/* Trigger history */}
      <div className="mt-10 flex items-center justify-between">
        <h2 className="text-lg font-bold">Trigger history</h2>
        <Button variant="outline" size="sm" onClick={simulateFuse}>
          <Zap className="mr-1 size-4" />
          Simulate a fuse (demo banner)
        </Button>
      </div>
      <div className="mt-4 overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              {["Time", "Key", "Reason", "Action", "Status", ""].map((h) => (
                <th key={h} className="p-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id} className="border-b last:border-0">
                <td className="p-3 text-muted-foreground">{e.time}</td>
                <td className="p-3">{e.keyName}</td>
                <td className="p-3">{e.reason}</td>
                <td className="p-3">
                  <Badge
                    className={
                      e.action === "Fused"
                        ? "bg-red-500/15 text-red-600 dark:text-red-400"
                        : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                    }
                  >
                    {e.action}
                  </Badge>
                </td>
                <td className="p-3 text-muted-foreground">
                  {e.resolved ? "Recovered" : "Active"}
                </td>
                <td className="p-3">
                  {!e.resolved && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => unfreeze(e.id)}
                    >
                      <Snowflake className="mr-1 size-3.5" />
                      Unfreeze
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        Each API key can also have its own limit & fuse:{" "}
        <Link href="/settings/keys" className="text-primary hover:underline">
          Go to API Keys
        </Link>
      </p>
    </div>
  );
}
