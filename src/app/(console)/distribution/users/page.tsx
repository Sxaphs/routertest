"use client";

import { useState } from "react";
import { Download, Info, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { downloadCsv } from "@/lib/csv";
import { LimitFuseDialog } from "@/components/limit-fuse-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DISTRIBUTOR_BUDGET,
  MOCK_SUBACCOUNTS,
  type SubAccount,
} from "@/mocks/distribution";

/** 简单进度条（无 ui 组件，直接写） */
function ProgressBar({ ratio }: { ratio: number }) {
  const pct = Math.min(Math.max(ratio, 0), 1) * 100;
  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full bg-muted"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
    >
      <div
        className={
          pct > 90 ? "h-full bg-red-500" : pct > 70 ? "h-full bg-amber-500" : "h-full bg-primary"
        }
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}


/**
 * 终端用户管理（/distribution/users）：双层保险丝 + 子账户表 + 每用户配置。
 * 全部内存 mock，TODO(backend): 接子账户与限额接口。
 */
export default function DistributionUsersPage() {
  const [accounts, setAccounts] = useState<SubAccount[]>(MOCK_SUBACCOUNTS);
  const [editing, setEditing] = useState<SubAccount | null>(null);

  const budgetRatio = DISTRIBUTOR_BUDGET.spent / DISTRIBUTOR_BUDGET.monthlyBudget;

  const openConfigure = (a: SubAccount) => setEditing(a);

  const saveConfigure = (limitStr: string, autoFuse: boolean) => {
    // TODO(backend): 持久化用户级限额与保险丝
    if (!editing) return;
    const limit = limitStr.trim() === "" ? null : parseLimit(limitStr);
    setAccounts((prev) =>
      prev.map((a) => (a.id === editing.id ? { ...a, monthlyLimit: limit, autoFuse } : a)),
    );
    setEditing(null);
  };

  const toggleStatus = (id: string) => {
    // TODO(backend): 调用真实启用/停用接口
    setAccounts((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: a.status === "active" ? "disabled" : "active" }
          : a,
      ),
    );
  };

  const exportCsv = () => {
    // TODO(backend): 大数据量时改服务端导出
    downloadCsv("end-users.csv", [
      ["Name", "Keys", "Monthly spend", "Balance", "Monthly limit", "Auto-fuse", "Status"],
      ...accounts.map((a) => [
        a.name,
        String(a.keyCount),
        a.monthlySpend,
        a.balance,
        a.monthlyLimit == null ? "" : `$${a.monthlyLimit}`,
        a.autoFuse ? "on" : "off",
        a.status,
      ]),
    ]);
  };

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">End Users</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage sub-accounts, per-user limits, and spend fuses.
          </p>
        </div>
        <Button variant="outline" onClick={exportCsv}>
          <Download className="mr-1 size-4" />
          Export CSV
        </Button>
      </div>

      {/* 双层保险丝说明卡 */}
      <Card className="mt-6">
        <CardContent className="space-y-5 pt-6">
          <h2 className="flex items-center gap-1 font-semibold">
            <ShieldCheck className="size-4 text-primary" />
            Two-layer spend fuses
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="size-3.5 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-72">
                  Layer 1 caps your whole reseller account; layer 2 caps each end
                  user. Either fuse tripping stops the affected traffic.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </h2>

          {/* 上层：分销商总预算 */}
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">
                Layer 1 — Your distributor budget
              </span>
              <span className="text-muted-foreground">
                ${DISTRIBUTOR_BUDGET.spent.toLocaleString()} of $
                {DISTRIBUTOR_BUDGET.monthlyBudget.toLocaleString()} this month
              </span>
            </div>
            <div className="mt-2">
              <ProgressBar ratio={budgetRatio} />
            </div>
            <label className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Switch checked={DISTRIBUTOR_BUDGET.autoFuse} disabled />
              Auto-fuse all traffic when the budget is exhausted
            </label>
          </div>

          {/* 下层：每用户限额 */}
          <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
            Layer 2 — Per-user limits: set a monthly limit and optional auto-fuse
            per end user via <span className="font-medium text-foreground">Configure</span> in
            the table below. Users without a limit are only bounded by your
            distributor budget.
          </div>
        </CardContent>
      </Card>

      {/* 子账户表 */}
      <div className="mt-6 overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              {["Name", "Keys", "Monthly spend", "Balance", "Monthly limit", "Status", ""].map(
                (h) => (
                  <th key={h} className="p-3 font-medium">
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {accounts.map((a) => (
              <tr key={a.id} className="border-b last:border-0">
                <td className="p-3 font-medium">{a.name}</td>
                <td className="p-3 text-muted-foreground">{a.keyCount}</td>
                <td className="p-3">{a.monthlySpend}</td>
                <td className="p-3">{a.balance}</td>
                <td className="p-3 text-muted-foreground">
                  {a.monthlyLimit == null ? "—" : `$${a.monthlyLimit.toLocaleString()}`}
                  {a.autoFuse && a.monthlyLimit != null && (
                    <Badge variant="secondary" className="ml-2">
                      auto-fuse
                    </Badge>
                  )}
                </td>
                <td className="p-3">
                  <Badge
                    className={
                      a.status === "active"
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : "bg-red-500/15 text-red-600 dark:text-red-400"
                    }
                  >
                    {a.status}
                  </Badge>
                </td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => openConfigure(a)}>
                      Configure
                    </Button>
                    <Button
                      variant={a.status === "active" ? "ghost" : "outline"}
                      size="sm"
                      onClick={() => toggleStatus(a.id)}
                    >
                      {a.status === "active" ? "Disable" : "Enable"}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Configure 弹窗（内存保存） */}
      <LimitFuseDialog
        open={editing !== null}
        onOpenChange={(o) => !o && setEditing(null)}
        title={`Configure ${editing?.name ?? ""}`}
        description="Per-user monthly limit and auto-fuse. Leave the limit empty for no cap. (mock, TODO(backend))"
        initialLimit={editing?.monthlyLimit?.toString() ?? ""}
        initialAutoFuse={editing?.autoFuse ?? false}
        onSave={saveConfigure}
      />
    </div>
  );
}

/** 防止非数字输入把 limit 变 NaN */
function parseLimit(v: string): number {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}
