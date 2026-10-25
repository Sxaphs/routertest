"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Clock,
  Copy,
  Flag,
  Loader2,
  ShieldCheck,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, formatMoney } from "@/lib/format";
import {
  CURRENT_ADMIN,
  MOCK_REVIEWS,
  REVIEW_STATUS_LABELS,
  appendAuditLog,
  type AuditEntry,
  type Review,
  type ReviewStatus,
} from "@/mocks/admin";
import { cn } from "@/lib/utils";

/**
 * 统一审核队列（风控核心页）：crypto 提现 + 退款。
 * 状态机：提现 pending → approved → awaiting_payout →（回填 TxHash）→ sent；
 *        退款 pending → approved → refunded；驳回 pending → rejected。每步写 auditTrail。
 * TODO(backend): GET /v1/admin/reviews、POST .../approve|reject|payout-tx
 */

const SLA_MS = 24 * 3600 * 1000;

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS);
  const [tab, setTab] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<"approve" | "reject" | null>(null);
  const [reason, setReason] = useState("");
  const [txHash, setTxHash] = useState("");
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  // SLA 计时依赖当前时间，挂载后才取，避免 hydration 不一致
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => setNow(Date.now()), []);

  const pendingCount = reviews.filter((r) => r.status === "pending").length;
  const filtered = reviews.filter(
    (r) =>
      (tab === "all" || r.type === tab) &&
      (statusFilter === "all" || r.status === statusFilter),
  );
  const selected = reviews.find((r) => r.id === selectedId) ?? null;

  const appendAudit = (id: string, entry: AuditEntry) =>
    setReviews((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, auditTrail: [...r.auditTrail, entry] } : r,
      ),
    );

  const setStatus = (id: string, status: ReviewStatus) =>
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));

  const doApprove = async () => {
    if (!selected) return;
    setBusy(true);
    await new Promise((r) => setTimeout(r, 300)); // mock 网络延迟
    // 提现通过 → 待打款；退款通过 → 待退款执行
    const next: ReviewStatus =
      selected.type === "crypto_withdrawal" ? "awaiting_payout" : "approved";
    setStatus(selected.id, next);
    appendAudit(selected.id, {
      at: new Date().toISOString(),
      actor: CURRENT_ADMIN,
      action: "Approved",
      reason: reason.trim() || undefined,
    });
    appendAuditLog({
      at: new Date().toISOString(),
      actor: CURRENT_ADMIN,
      area: "review",
      action: "Approved",
      target: selected.id,
      reason: reason.trim() || undefined,
    });
    setBusy(false);
    setConfirmAction(null);
    setReason("");
  };

  const doReject = async () => {
    if (!selected || !reason.trim()) return; // 驳回必填理由
    setBusy(true);
    await new Promise((r) => setTimeout(r, 300));
    setStatus(selected.id, "rejected");
    appendAudit(selected.id, {
      at: new Date().toISOString(),
      actor: CURRENT_ADMIN,
      action: "Rejected",
      reason: reason.trim(),
    });
    appendAuditLog({
      at: new Date().toISOString(),
      actor: CURRENT_ADMIN,
      area: "review",
      action: "Rejected",
      target: selected.id,
      reason: reason.trim(),
    });
    setBusy(false);
    setConfirmAction(null);
    setReason("");
  };

  const submitPayout = async () => {
    if (!selected || txHash.trim().length < 8) return;
    setBusy(true);
    await new Promise((r) => setTimeout(r, 300));
    setStatus(selected.id, "sent");
    appendAudit(selected.id, {
      at: new Date().toISOString(),
      actor: CURRENT_ADMIN,
      action: "Payout sent",
      reason: `tx ${txHash.trim()}`,
    });
    appendAuditLog({
      at: new Date().toISOString(),
      actor: CURRENT_ADMIN,
      area: "payout",
      action: "Payout sent",
      target: selected.id,
      reason: `tx ${txHash.trim()}`,
    });
    setBusy(false);
    setTxHash("");
  };

  const markRefunded = async () => {
    if (!selected) return;
    setBusy(true);
    await new Promise((r) => setTimeout(r, 300));
    setStatus(selected.id, "refunded");
    appendAudit(selected.id, {
      at: new Date().toISOString(),
      actor: CURRENT_ADMIN,
      action: "Marked refunded",
      reason: "Returned to original payment method",
    });
    appendAuditLog({
      at: new Date().toISOString(),
      actor: CURRENT_ADMIN,
      area: "review",
      action: "Marked refunded",
      target: selected.id,
      reason: "Returned to original payment method",
    });
    setBusy(false);
  };

  const copyAddress = async (address: string) => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="max-w-5xl">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">Review Queue</h1>
        <Badge className="bg-primary/15 text-primary">
          {pendingCount} pending
        </Badge>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Crypto withdrawals and refunds awaiting manual risk review. Rows pending
        over 24h are highlighted (SLA).
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="crypto_withdrawal">Withdrawals</TabsTrigger>
            <TabsTrigger value="refund">Refunds</TabsTrigger>
          </TabsList>
        </Tabs>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {Object.entries(REVIEW_STATUS_LABELS).map(([v, label]) => (
              <SelectItem key={v} value={v}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              {["ID", "Type", "User", "Amount", "Risk flags", "Status", "Created"].map(
                (h) => (
                  <th key={h} className="p-3 font-medium">
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const overSla =
                r.status === "pending" &&
                now !== null &&
                now - Date.parse(r.createdAt) > SLA_MS;
              return (
                <tr
                  key={r.id}
                  className={cn(
                    "cursor-pointer border-b last:border-0 hover:bg-accent/50",
                    overSla && "bg-amber-500/10 hover:bg-amber-500/15",
                  )}
                  onClick={() => {
                    setSelectedId(r.id);
                    setTxHash("");
                    setReason("");
                  }}
                >
                  <td className="p-3 font-mono text-xs">{r.id}</td>
                  <td className="p-3">
                    {r.type === "crypto_withdrawal" ? "Withdrawal" : "Refund"}
                  </td>
                  <td className="p-3 text-muted-foreground">{r.user}</td>
                  <td className="p-3">{formatMoney(r.amount, r.currency)}</td>
                  <td className="p-3">
                    <span className="flex flex-wrap gap-1">
                      {r.riskFlags.length === 0 && (
                        <span className="text-muted-foreground">—</span>
                      )}
                      {r.riskFlags.map((f) => (
                        <Badge
                          key={f}
                          variant="secondary"
                          className="bg-amber-500/15 text-amber-600 dark:text-amber-400"
                        >
                          <Flag className="mr-1 size-3" />
                          {f}
                        </Badge>
                      ))}
                    </span>
                  </td>
                  <td className="p-3">
                    <Badge variant="secondary">
                      {REVIEW_STATUS_LABELS[r.status]}
                    </Badge>
                    {overSla && (
                      <Clock className="ml-1 inline size-3.5 text-amber-500" />
                    )}
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {formatDate(r.createdAt)}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-muted-foreground">
                  No reviews match the filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* 游标分页占位 TODO(backend): cursor= 参数 */}
      <div className="mt-3 flex justify-end">
        <Button variant="outline" size="sm" disabled>
          Next page (cursor pagination, TODO(backend))
        </Button>
      </div>

      {/* 详情抽屉（宽 Dialog）：左侧信息 + 右侧操作区 */}
      <Dialog open={selected !== null} onOpenChange={(o) => !o && setSelectedId(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selected.type === "crypto_withdrawal" ? "Withdrawal" : "Refund"}{" "}
                  <code className="text-sm">{selected.id}</code>
                  <Badge variant="secondary">
                    {REVIEW_STATUS_LABELS[selected.status]}
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  {selected.user} · {formatMoney(selected.amount, selected.currency)} ·
                  created {formatDate(selected.createdAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 md:grid-cols-5">
                {/* 左：完整信息 + 风险旗标 */}
                <div className="space-y-3 text-sm md:col-span-3">
                  {selected.detail.kind === "crypto_withdrawal" ? (
                    <div className="space-y-2 rounded-lg border p-3">
                      <p className="font-medium">Payout destination</p>
                      <div className="flex items-start gap-2">
                        <code className="flex-1 break-all rounded bg-muted p-2 font-mono text-xs">
                          {selected.detail.address}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Copy address"
                          onClick={() => copyAddress(selected.detail.kind === "crypto_withdrawal" ? selected.detail.address : "")}
                        >
                          {copied ? (
                            <Check className="size-4 text-emerald-500" />
                          ) : (
                            <Copy className="size-4" />
                          )}
                        </Button>
                      </div>
                      <p>
                        {selected.detail.token} on {selected.detail.chain}
                      </p>
                      <p className="text-muted-foreground">
                        Rail-consistency: user crypto-withdrawable{" "}
                        <b>
                          {formatMoney(selected.detail.withdrawableUsd)}
                        </b>{" "}
                        {selected.amount <= selected.detail.withdrawableUsd
                          ? "≥ amount ✓"
                          : "< amount ✗"}
                      </p>
                      <p className="text-muted-foreground">
                        Email 2FA:{" "}
                        {selected.detail.emailVerified ? "passed ✓" : "not passed ✗"}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1.5 rounded-lg border p-3">
                      <p className="font-medium">Refund context</p>
                      <p>Original method: {selected.detail.originalMethod}</p>
                      <p className="text-muted-foreground">
                        Top-up consumed: {selected.detail.consumedPct}%
                      </p>
                      <p className="text-muted-foreground">
                        Refunds in last 30 days: {selected.detail.refunds30d}
                      </p>
                      <p className="text-muted-foreground">
                        Account age: {selected.detail.accountAgeDays} days
                      </p>
                    </div>
                  )}

                  <div className="rounded-lg border p-3">
                    <p className="mb-1.5 font-medium">Risk flags</p>
                    {selected.riskFlags.length === 0 ? (
                      <p className="text-muted-foreground">None</p>
                    ) : (
                      <span className="flex flex-wrap gap-1">
                        {selected.riskFlags.map((f) => (
                          <Badge
                            key={f}
                            variant="secondary"
                            className="bg-amber-500/15 text-amber-600 dark:text-amber-400"
                          >
                            <Flag className="mr-1 size-3" />
                            {f}
                          </Badge>
                        ))}
                      </span>
                    )}
                  </div>

                  <div className="rounded-lg border p-3">
                    <p className="mb-1.5 font-medium">Audit trail</p>
                    {selected.auditTrail.length === 0 ? (
                      <p className="text-muted-foreground">No actions yet.</p>
                    ) : (
                      <ul className="space-y-1.5">
                        {selected.auditTrail.map((a, i) => (
                          <li key={i} className="text-xs text-muted-foreground">
                            <b className="text-foreground">{a.action}</b> by {a.actor} ·{" "}
                            {formatDate(a.at)}
                            {a.reason ? ` — ${a.reason}` : ""}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* 右：操作区 */}
                <div className="space-y-2 md:col-span-2">
                  {selected.status === "pending" && (
                    <>
                      <Button
                        className="w-full"
                        onClick={() => setConfirmAction("approve")}
                      >
                        <Check className="mr-2 size-4" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setConfirmAction("reject")}
                      >
                        <X className="mr-2 size-4" />
                        Reject
                      </Button>
                    </>
                  )}
                  {selected.status === "awaiting_payout" &&
                    selected.type === "crypto_withdrawal" && (
                      <div className="space-y-2 rounded-lg border border-dashed p-3">
                        <p className="text-sm font-medium">Backfill TxHash</p>
                        <p className="text-xs text-muted-foreground">
                          Payout is executed via Stripe crypto payout. Paste the
                          on-chain TxHash from the Stripe dashboard for
                          reconciliation.
                        </p>
                        <Input
                          value={txHash}
                          onChange={(e) => setTxHash(e.target.value)}
                          placeholder="0x… transaction hash"
                          className="font-mono text-xs"
                          aria-label="Payout transaction hash"
                        />
                        <Button
                          className="w-full"
                          disabled={busy || txHash.trim().length < 8}
                          onClick={submitPayout}
                        >
                          {busy ? (
                            <Loader2 className="mr-2 size-4 animate-spin" />
                          ) : null}
                          Submit &amp; mark sent
                        </Button>
                      </div>
                    )}
                  {selected.status === "approved" && selected.type === "refund" && (
                    <Button className="w-full" disabled={busy} onClick={markRefunded}>
                      {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                      Mark as refunded
                    </Button>
                  )}
                  {["rejected", "sent", "refunded"].includes(selected.status) && (
                    <p className="flex items-center gap-1.5 rounded-md bg-muted p-3 text-xs text-muted-foreground">
                      <ShieldCheck className="size-3.5" />
                      Terminal state — no further actions.
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 通过/驳回 二次确认 */}
      <Dialog
        open={confirmAction !== null}
        onOpenChange={(o) => !o && setConfirmAction(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction === "approve" ? "Approve" : "Reject"} {selected?.id}?
            </DialogTitle>
            <DialogDescription>
              {confirmAction === "approve"
                ? selected?.type === "crypto_withdrawal"
                  ? "The withdrawal moves to Awaiting payout. Funds are not sent until a TxHash is backfilled."
                  : "The refund is approved and can then be marked refunded to the original payment method."
                : "A reason is required for rejection."}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={
              confirmAction === "approve"
                ? "Note (optional)"
                : "Reason for rejection (required)"
            }
            aria-label="Action reason"
          />
          <Button
            className="w-full"
            variant={confirmAction === "reject" ? "destructive" : "default"}
            disabled={busy || (confirmAction === "reject" && !reason.trim())}
            onClick={confirmAction === "approve" ? doApprove : doReject}
          >
            {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            Confirm {confirmAction}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
