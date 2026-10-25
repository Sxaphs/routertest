"use client";

import { useState } from "react";
import Link from "next/link";
import { CreditCard, ExternalLink, Info, RefreshCw, ShieldCheck, Trash2 } from "lucide-react";
import { brand } from "@/config/brand";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  MOCK_REFUNDS,
  MOCK_TRANSACTIONS,
  type Refund,
  type Transaction,
  redeemPromoCode,
} from "@/mocks/billing";
import {
  TX_STATUS_LABELS,
  formatDate,
  formatMoney,
  formatSignedMoney,
} from "@/lib/format";
import {
  paymentProvider,
  type IntentStatus,
  type SavedPaymentMethod,
  type TopupIntent,
} from "@/lib/payments";
import { CryptoTopup } from "@/components/crypto-topup";
import { PaymentSheet } from "@/components/payment-sheet";

/** 退款状态枚举 → 文案（展示归前端） */
const REFUND_STATUS_LABELS: Record<Refund["status"], string> = {
  processing: "Processing",
  refunded: "Refunded to original payment method",
};

/**
 * 余额与充值（全部 mock，TODO(backend): 接 OURBRAND 账单/支付）。
 * 充值统一走 Stripe 收银台模式（PaymentSheet + lib/payments 适配层）。
 */
export default function CreditsPage() {
  const [crypto, setCrypto] = useState(false);
  const [fiatSheetOpen, setFiatSheetOpen] = useState(false);
  const [balance] = useState("0.00"); // TODO(backend): 真实余额
  const [refunds, setRefunds] = useState<Refund[]>(MOCK_REFUNDS);
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [refundOpen, setRefundOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoMsg, setPromoMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [promoBusy, setPromoBusy] = useState(false);
  const [pmOpen, setPmOpen] = useState(false);
  const [payMethods, setPayMethods] = useState<SavedPaymentMethod[]>([]);

  /** upsert 一条流水（按 id 覆盖，否则置顶插入） */
  const upsertTx = (tx: Transaction) =>
    setTransactions((prev) =>
      prev.some((t) => t.id === tx.id)
        ? prev.map((t) => (t.id === tx.id ? tx : t))
        : [tx, ...prev],
    );

  /** 充值 intent 状态驱动交易表（confirming → credited / failed）；
   *  正式版由 webhook 入账，前端只轮询确认（TODO(backend)） */
  const onTopupStatus = (intent: TopupIntent, status: IntentStatus) => {
    upsertTx({
      id: intent.intentId,
      createdAt: new Date().toISOString(),
      type: "Top-up",
      amount: intent.amount,
      currency: intent.currency,
      fee: "0.00", // TODO(backend): 手续费由支付渠道回调写入
      method: intent.rail === "crypto" ? "USDC via Stripe" : "Card via Stripe",
      status,
    });
  };

  const submitRefund = () => {
    // TODO(backend): 提交真实退款申请
    if (!refundAmount) return;
    setRefunds((prev) => [
      {
        id: `rf-${Date.now().toString(36)}`,
        createdAt: new Date().toISOString(),
        amount: Number(refundAmount).toFixed(2),
        currency: "USD",
        reason: refundReason || "User refund request",
        status: "processing",
      },
      ...prev,
    ]);
    setRefundOpen(false);
    setRefundAmount("");
    setRefundReason("");
  };

  const submitPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoBusy(true);
    setPromoMsg(null);
    try {
      // TODO(backend): POST /v1/billing/promo-codes/redeem
      const { credit } = await redeemPromoCode(promoCode);
      upsertTx({
        id: `promo-${Date.now().toString(36)}`,
        createdAt: new Date().toISOString(),
        type: "Top-up",
        amount: credit,
        currency: "USD",
        fee: "0.00",
        method: "Promo code",
        status: "completed",
      });
      setPromoMsg({ ok: true, text: `${formatMoney(credit)} credit applied` });
      setPromoCode("");
    } catch (e) {
      setPromoMsg({
        ok: false,
        text: e instanceof Error ? e.message : "Redeem failed",
      });
    } finally {
      setPromoBusy(false);
    }
  };

  const openPaymentMethods = async (open: boolean) => {
    setPmOpen(open);
    if (open) setPayMethods(await paymentProvider.listPaymentMethods());
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Credits</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Personal Account: user@example.com
          </p>
        </div>
        <Button variant="ghost" size="icon" aria-label="Refresh">
          <RefreshCw className="size-4" />
        </Button>
      </div>

      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <p className="flex items-center gap-1 text-xs uppercase tracking-wide text-muted-foreground">
              Total available
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="size-3.5" />
                  </TooltipTrigger>
                  <TooltipContent>Pay-as-you-go balance</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </p>
            {/* 计费公平：Never expires标识 */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="mr-1 size-3" />
                    Never expires
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="max-w-64">
                  Your topped-up balance never expires. We don’t profit from expiring credits.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="mt-1 text-4xl font-extrabold">${balance}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Pay-as-you-go balance
          </p>
        </CardContent>
      </Card>

      <div className="mt-4 text-sm">
        <p className="text-muted-foreground">Move credits to organization</p>
        <Link href="#" className="underline underline-offset-4">
          Enable two-step verification on your account to transfer credits →
        </Link>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Buy Credits</h2>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                Use crypto
                <Switch checked={crypto} onCheckedChange={setCrypto} />
              </label>
            </div>
            {crypto ? (
              <CryptoTopup onStatus={onTopupStatus} />
            ) : fiatSheetOpen ? (
              <div className="mt-4 rounded-lg border p-4">
                <p className="mb-3 text-sm font-medium">Pay with card</p>
                <PaymentSheet rail="fiat" onStatus={onTopupStatus} />
              </div>
            ) : (
              <Button className="mt-4 w-full" onClick={() => setFiatSheetOpen(true)}>
                Add Credits
              </Button>
            )}
            <div className="mt-3 flex justify-between text-sm">
              <Link href="/activity" className="flex items-center gap-1 hover:underline">
                View Usage <ExternalLink className="size-3" />
              </Link>
              <Dialog open={promoOpen} onOpenChange={setPromoOpen}>
                <DialogTrigger asChild>
                  <button className="hover:underline">Redeem Promo Code</button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Redeem promo code</DialogTitle>
                    <DialogDescription>
                      Enter a promo code to apply credits to your balance.
                      (mock: try WELCOME, TODO(backend))
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm" htmlFor="promo-code">
                        Promo code
                      </label>
                      <Input
                        id="promo-code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="e.g. WELCOME"
                      />
                    </div>
                    {promoMsg && (
                      <p
                        className={
                          promoMsg.ok
                            ? "text-sm text-emerald-600 dark:text-emerald-400"
                            : "text-sm text-destructive"
                        }
                        role={promoMsg.ok ? undefined : "alert"}
                      >
                        {promoMsg.text}
                      </p>
                    )}
                    <Button
                      className="w-full"
                      disabled={promoBusy || !promoCode.trim()}
                      onClick={submitPromo}
                    >
                      {promoBusy ? "Redeeming…" : "Apply code"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <h2 className="font-semibold">Auto Top-Up</h2>
            <Dialog open={pmOpen} onOpenChange={openPaymentMethods}>
              <DialogTrigger asChild>
                <Button variant="outline" className="mt-4 w-full">
                  Add a Payment Method
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Payment methods</DialogTitle>
                  <DialogDescription>
                    Cards on file for top-ups and auto top-up. (mock, TODO(backend):
                    GET/POST/DELETE /v1/billing/payment-methods)
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                  {payMethods.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center gap-2 rounded-md border p-3 text-sm"
                    >
                      <CreditCard className="size-4 text-muted-foreground" />
                      <span className="capitalize">{m.brand}</span>
                      <span className="font-mono">•• {m.last4}</span>
                      <span className="text-muted-foreground">
                        {String(m.expMonth).padStart(2, "0")}/{m.expYear}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-auto"
                        aria-label={`Remove ${m.brand} •• ${m.last4}`}
                        onClick={async () => {
                          await paymentProvider.deletePaymentMethod(m.id);
                          setPayMethods(await paymentProvider.listPaymentMethods());
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                  {payMethods.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No payment methods yet.
                    </p>
                  )}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={async () => {
                      await paymentProvider.addPaymentMethod();
                      setPayMethods(await paymentProvider.listPaymentMethods());
                    }}
                  >
                    Add card (mock)
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <p className="mt-3 text-sm text-muted-foreground">
              To activate auto-top-up, you&apos;ll need a payment method that
              supports offline charging.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 出金 = 仅原路退款（卡退卡 / USDC 退 Stripe 关联原支付钱包）。
          「提现到任意钱包」功能已按产品决策移除；如需恢复见 git 历史 */}

      <h2 className="mt-10 text-lg font-bold">Recent Transactions</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Need enterprise billing options?{" "}
        <Link href="#" className="underline underline-offset-4">
          Contact sales
        </Link>
      </p>
      {/* TODO(backend): 真实交易流水 GET /v1/billing/transactions */}
      <div className="mt-4 overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              {["Date", "Type", "Amount", "Fee paid", "Method", "Status"].map((h) => (
                <th key={h} className="p-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id} className="border-b last:border-0">
                <td className="p-3 text-muted-foreground">{formatDate(t.createdAt)}</td>
                <td className="p-3">{t.type}</td>
                <td className="p-3">
                  {formatSignedMoney(
                    t.amount,
                    t.currency,
                    t.type === "Top-up" || t.type === "Refund" ? "in" : "out",
                  )}
                </td>
                <td className="p-3 text-muted-foreground">
                  {formatMoney(t.fee, t.currency)}
                </td>
                <td className="p-3 text-muted-foreground">{t.method}</td>
                <td className="p-3">
                  <Badge variant="secondary">{TX_STATUS_LABELS[t.status]}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 退款（计费公平） */}
      <div className="mt-10 flex items-center justify-between">
        <h2 className="text-lg font-bold">Refunds</h2>
        <Dialog open={refundOpen} onOpenChange={setRefundOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Request refund</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request a refund</DialogTitle>
              <DialogDescription>
                Unused top-ups can be refunded to the original payment method. (mock, TODO(backend))
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm" htmlFor="refund-amount">
                  Amount (USD)
                </label>
                <Input
                  id="refund-amount"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  placeholder="e.g. 20.00"
                  inputMode="decimal"
                />
              </div>
              <div>
                <label className="text-sm" htmlFor="refund-reason">
                  Reason
                </label>
                <Input
                  id="refund-reason"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Briefly describe why"
                />
              </div>
              <Button className="w-full" onClick={submitRefund}>
                Submit request
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="mt-4 overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              {["Date", "Amount", "Reason", "Status"].map((h) => (
                <th key={h} className="p-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {refunds.map((r) => (
              <tr key={r.id} className="border-b last:border-0">
                <td className="p-3 text-muted-foreground">{formatDate(r.createdAt)}</td>
                <td className="p-3">{formatMoney(r.amount, r.currency)}</td>
                <td className="p-3 text-muted-foreground">{r.reason}</td>
                <td className="p-3">
                  <Badge
                    className={
                      r.status === "refunded"
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                    }
                  >
                    {REFUND_STATUS_LABELS[r.status]}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-8 text-xs text-muted-foreground">
        {brand.name} is a demo environment — all billing data is placeholder.
      </p>
    </div>
  );
}
