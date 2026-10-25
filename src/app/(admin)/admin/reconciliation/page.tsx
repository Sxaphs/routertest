"use client";

import { useState } from "react";
import { Loader2, Lock, LockOpen } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { formatDate, formatMoney } from "@/lib/format";
import {
  CURRENT_ADMIN,
  MOCK_RECON_DAYS,
  RECON_META,
  appendAuditLog,
  reconDiffTotal,
  type AuditEntry,
} from "@/mocks/admin";
import { cn } from "@/lib/utils";

/**
 * 每日对账：Stripe 报表 ↔ 内部账本 ↔ 银行/链上实际，三方金额 + 差异列。
 * 差异 ≠ 0 时出金队列自动冻结，人工解除需理由并写 auditTrail。
 * TODO(backend): GET /v1/admin/reconciliation、POST /v1/admin/reconciliation/unfreeze
 */
export default function AdminReconciliationPage() {
  const diffTotal = reconDiffTotal(MOCK_RECON_DAYS);
  const [frozen, setFrozen] = useState(diffTotal !== 0);
  const [unfreezeOpen, setUnfreezeOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [overrides, setOverrides] = useState<AuditEntry[]>([]);

  const unfreeze = async () => {
    if (!reason.trim()) return;
    setBusy(true);
    await new Promise((r) => setTimeout(r, 300)); // mock 网络延迟
    // TODO(backend): POST /v1/admin/reconciliation/unfreeze（理由写审计日志）
    setFrozen(false);
    setOverrides((prev) => [
      ...prev,
      {
        at: new Date().toISOString(),
        actor: CURRENT_ADMIN,
        action: "Manual unfreeze",
        reason: reason.trim(),
      },
    ]);
    appendAuditLog({
      at: new Date().toISOString(),
      actor: CURRENT_ADMIN,
      area: "reconciliation",
      action: "Manual unfreeze",
      target: "payout queue",
      reason: reason.trim(),
    });
    setBusy(false);
    setUnfreezeOpen(false);
    setReason("");
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold">Reconciliation</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Daily three-way check: Stripe report vs internal ledger vs bank / on-chain
        actuals. Rows with non-zero diff are highlighted.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Last run
            </p>
            <p className="mt-1 text-lg font-semibold">
              {formatDate(RECON_META.lastRunAt)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Consecutive balanced days
            </p>
            <p className="mt-1 text-lg font-semibold">
              {RECON_META.consecutiveBalancedDays}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Current total diff
            </p>
            <p
              className={cn(
                "mt-1 text-lg font-semibold",
                diffTotal !== 0 && "text-destructive",
              )}
            >
              {formatMoney(diffTotal)}
            </p>
          </CardContent>
        </Card>
      </div>

      {frozen && (
        <div className="mt-4 flex items-center justify-between rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm">
          <p className="flex items-center gap-2 font-medium">
            <Lock className="size-4 text-destructive" />
            Payout queue auto-frozen — non-zero reconciliation diff detected
          </p>
          <Button variant="outline" size="sm" onClick={() => setUnfreezeOpen(true)}>
            <LockOpen className="mr-1.5 size-4" />
            Manual unfreeze
          </Button>
        </div>
      )}
      {!frozen && (
        <div className="mt-4 space-y-2">
          <p className="flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm font-medium text-emerald-600 dark:text-emerald-400">
            <LockOpen className="size-4" />
            Payout queue active
          </p>
          {overrides.map((o, i) => (
            <p key={i} className="text-xs text-muted-foreground">
              Override: <b>{o.action}</b> by {o.actor} · {formatDate(o.at)} — {o.reason}
            </p>
          ))}
        </div>
      )}

      <div className="mt-4 overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              {["Date", "Stripe report", "Internal ledger", "Bank / on-chain", "Diff", "State"].map(
                (h) => (
                  <th key={h} className="p-3 font-medium">
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {[...MOCK_RECON_DAYS].reverse().map((d) => {
              const diff = Math.round((d.ledger - d.actual) * 100) / 100;
              return (
                <tr
                  key={d.date}
                  className={cn(
                    "border-b last:border-0",
                    diff !== 0 && "bg-destructive/10",
                  )}
                >
                  <td className="p-3 text-muted-foreground">{formatDate(d.date)}</td>
                  <td className="p-3">{formatMoney(d.stripe)}</td>
                  <td className="p-3">{formatMoney(d.ledger)}</td>
                  <td className="p-3">{formatMoney(d.actual)}</td>
                  <td
                    className={cn(
                      "p-3 font-medium",
                      diff !== 0 && "text-destructive",
                    )}
                  >
                    {diff === 0 ? "—" : formatMoney(diff)}
                  </td>
                  <td className="p-3">
                    <Badge
                      variant="secondary"
                      className={
                        diff === 0
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : "bg-destructive/15 text-destructive"
                      }
                    >
                      {diff === 0 ? "Balanced" : "Mismatch"}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 人工解除冻结：二次确认 + 必填理由 */}
      <Dialog open={unfreezeOpen} onOpenChange={setUnfreezeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manually unfreeze payout queue?</DialogTitle>
            <DialogDescription>
              The queue was auto-frozen because of a non-zero reconciliation diff.
              Unfreezing requires a reason and is written to the audit trail.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for manual unfreeze (required)"
            aria-label="Unfreeze reason"
          />
          <Button
            className="w-full"
            variant="destructive"
            disabled={busy || !reason.trim()}
            onClick={unfreeze}
          >
            {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            Confirm unfreeze
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
