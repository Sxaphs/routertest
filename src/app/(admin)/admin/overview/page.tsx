"use client";

import { CheckCircle2, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatMoney } from "@/lib/format";
import {
  MOCK_OPS_METRICS,
  MOCK_PAYOUT_ACCOUNTS,
  OPS_THRESHOLDS,
} from "@/mocks/admin";
import { cn } from "@/lib/utils";

/**
 * 运维底线面板：五张告警状态卡（阈值写死在 OPS_THRESHOLDS mock 配置）
 * + Stripe 出金流动性区块（payout 账户余额/单日限额健康度，目标 2–3 倍）。
 * 出金走 Stripe crypto payout，平台不自持热钱包，无 gas 管理负担。
 * TODO(backend): GET /v1/admin/ops/overview
 */
export default function AdminOverviewPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold">Ops Overview</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Bottom-line operational alarms. Thresholds are configured in mock for now
        (TODO(backend)).
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {MOCK_OPS_METRICS.map((m) => (
          <Card key={m.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {m.title}
                </p>
                {m.status === "ok" ? (
                  <CheckCircle2 className="size-4 text-emerald-500" />
                ) : (
                  <TriangleAlert className="size-4 text-amber-500" />
                )}
              </div>
              <p
                className={cn(
                  "mt-1 text-xl font-bold",
                  m.status === "warn" && "text-amber-600 dark:text-amber-400",
                )}
              >
                {m.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{m.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="mt-8 text-lg font-bold">Payout liquidity (Stripe)</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        USDC payout balances per chain, held in the Stripe payout account.
        Health = balance ÷ daily limit (target {OPS_THRESHOLDS.payoutMinRatio}–3×).
        Below {OPS_THRESHOLDS.payoutMinRatio}× shows a top-up reminder.
      </p>
      <div className="mt-3 overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              {["Chain", "USDC balance", "Daily limit", "Health"].map((h) => (
                <th key={h} className="p-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_PAYOUT_ACCOUNTS.map((w) => {
              const ratio = w.usdcBalance / w.dailyLimitUsd;
              const ratioLow = ratio < OPS_THRESHOLDS.payoutMinRatio;
              return (
                <tr key={w.chain} className="border-b last:border-0">
                  <td className="p-3 font-medium">{w.chain}</td>
                  <td className="p-3">{formatMoney(w.usdcBalance)}</td>
                  <td className="p-3 text-muted-foreground">
                    {formatMoney(w.dailyLimitUsd)}
                  </td>
                  <td className="p-3">
                    <Badge
                      variant="secondary"
                      className={
                        ratioLow
                          ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                          : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      }
                    >
                      {ratio.toFixed(1)}×{ratioLow ? " — top up recommended" : ""}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
