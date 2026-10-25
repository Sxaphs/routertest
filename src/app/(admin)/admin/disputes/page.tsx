"use client";

import { useEffect, useState } from "react";
import { FileCheck, Snowflake } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { formatMoney } from "@/lib/format";
import {
  CURRENT_ADMIN,
  DISPUTE_RATE,
  DISPUTE_STATUS_LABELS,
  MOCK_DISPUTES,
  appendAuditLog,
  type Dispute,
} from "@/mocks/admin";
import { cn } from "@/lib/utils";

/**
 * Stripe 拒付管理：争议列表 + 争议率仪表条（>0.9% 红色告警线）+
 * 行内「冻结该用户余额与 keys」开关、「标记已提交证据」。
 * TODO(backend): GET /v1/admin/disputes、POST .../freeze-user|evidence
 */
export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>(MOCK_DISPUTES);
  const [frozenUsers, setFrozenUsers] = useState<Record<string, boolean>>({});

  // 倒计时依赖当前时间，挂载后才取，避免 hydration 不一致
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  const ratePct = (DISPUTE_RATE.disputesThisMonth / DISPUTE_RATE.totalTransactions) * 100;
  const rateOver = ratePct > DISPUTE_RATE.alertPct;

  const countdown = (dueAt: string): { text: string; urgent: boolean } | null => {
    if (now === null) return null;
    const ms = Date.parse(dueAt) - now;
    if (ms <= 0) return { text: "Overdue", urgent: true };
    const h = Math.floor(ms / 3600_000);
    const d = Math.floor(h / 24);
    return {
      text: d > 0 ? `${d}d ${h % 24}h left` : `${h}h left`,
      urgent: ms < 48 * 3600_000,
    };
  };

  const markEvidence = (id: string) => {
    // TODO(backend): POST /v1/admin/disputes/{id}/evidence
    setDisputes((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: "evidence_submitted" } : d)),
    );
    appendAuditLog({
      at: new Date().toISOString(),
      actor: CURRENT_ADMIN,
      area: "dispute",
      action: "Evidence submitted",
      target: id,
    });
  };

  const toggleFreeze = (user: string, on: boolean) => {
    // TODO(backend): POST /v1/admin/disputes/{id}/freeze-user
    setFrozenUsers((prev) => ({ ...prev, [user]: on }));
    appendAuditLog({
      at: new Date().toISOString(),
      actor: CURRENT_ADMIN,
      area: "dispute",
      action: on ? "User frozen" : "User unfrozen",
      target: user,
      reason: on ? "Balance & API keys frozen during dispute" : undefined,
    });
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold">Disputes</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Stripe chargebacks. Submit evidence before the deadline; freeze abusive
        users&apos; balance and API keys while a dispute is open.
      </p>

      {/* 争议率仪表条 */}
      <div className="mt-4 rounded-lg border p-4">
        <div className="flex items-center justify-between text-sm">
          <p className="font-medium">
            Dispute rate this month:{" "}
            <b className={cn(rateOver && "text-destructive")}>
              {ratePct.toFixed(2)}%
            </b>{" "}
            <span className="text-muted-foreground">
              ({DISPUTE_RATE.disputesThisMonth} of {DISPUTE_RATE.totalTransactions} transactions)
            </span>
          </p>
          <p className="text-xs text-muted-foreground">
            alert at {DISPUTE_RATE.alertPct}%
          </p>
        </div>
        <div className="relative mt-2 h-2 rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full",
              rateOver ? "bg-destructive" : "bg-emerald-500",
            )}
            style={{ width: `${Math.min(100, (ratePct / 1.5) * 100)}%` }}
          />
          {/* 0.9% 告警线（量程 0–1.5%） */}
          <div
            className="absolute top-[-3px] h-[14px] w-0.5 bg-destructive"
            style={{ left: `${(DISPUTE_RATE.alertPct / 1.5) * 100}%` }}
          />
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              {["ID", "User", "Amount", "Reason", "Status", "Evidence due", "Actions"].map(
                (h) => (
                  <th key={h} className="p-3 font-medium">
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {disputes.map((d) => {
              const cd =
                d.status === "open" || d.status === "evidence_submitted"
                  ? countdown(d.dueAt)
                  : null;
              return (
                <tr key={d.id} className="border-b last:border-0">
                  <td className="p-3 font-mono text-xs">{d.id}</td>
                  <td className="p-3 text-muted-foreground">{d.user}</td>
                  <td className="p-3">{formatMoney(d.amount, d.currency)}</td>
                  <td className="p-3">{d.reason}</td>
                  <td className="p-3">
                    <Badge
                      variant="secondary"
                      className={cn(
                        d.status === "won" &&
                          "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
                        d.status === "lost" && "bg-destructive/15 text-destructive",
                      )}
                    >
                      {DISPUTE_STATUS_LABELS[d.status]}
                    </Badge>
                  </td>
                  <td
                    className={cn(
                      "p-3",
                      cd?.urgent && "font-medium text-destructive",
                    )}
                  >
                    {cd ? cd.text : "—"}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Snowflake className="size-3.5" />
                        Freeze user
                        <Switch
                          checked={!!frozenUsers[d.user]}
                          onCheckedChange={(on) => toggleFreeze(d.user, on)}
                          aria-label={`Freeze balance and keys for ${d.user}`}
                        />
                      </label>
                      {d.status === "open" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => markEvidence(d.id)}
                        >
                          <FileCheck className="mr-1.5 size-3.5" />
                          Mark evidence submitted
                        </Button>
                      )}
                    </div>
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
