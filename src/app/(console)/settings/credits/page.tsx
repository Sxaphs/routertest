"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, Info, RefreshCw, ShieldCheck } from "lucide-react";
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
  cryptoWithdrawable,
  isCryptoMethod,
} from "@/mocks/billing";
import { CryptoTopup } from "@/components/crypto-topup";
import { CryptoWithdraw } from "@/components/crypto-withdraw";

/**
 * 余额与充值（全部 mock，TODO(backend): 接 OURBRAND 账单/支付）。
 * 结构对齐参照站 /settings/credits。
 */
export default function CreditsPage() {
  const [crypto, setCrypto] = useState(false);
  const [balance] = useState("0.00"); // TODO(backend): 真实余额
  const [refunds, setRefunds] = useState<Refund[]>(MOCK_REFUNDS);
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [refundOpen, setRefundOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  // 演示场景：?fiatonly 模拟纯法币用户（隐藏 crypto 流水 → 提现入口置灰）
  const [fiatOnly, setFiatOnly] = useState(false);
  useEffect(() => {
    setFiatOnly(window.location.search.includes("fiatonly"));
  }, []);
  const visibleTx = fiatOnly
    ? transactions.filter((t) => !isCryptoMethod(t.method))
    : transactions;

  /** crypto 支付完成回调（mock 入账记录，TODO(backend): 后端确认后入账） */
  const onCryptoPaid = (amountUsd: string, txHash: string) => {
    setTransactions((prev) => [
      {
        id: `tx-crypto-${txHash.slice(2, 8)}`,
        date: "Oct 19, 2026",
        type: "Top-up",
        amount: `+$${amountUsd}`,
        fee: "$0.00",
        method: `Crypto ${txHash.slice(0, 10)}…`,
        status: "Confirming",
      },
      ...prev,
    ]);
  };

  /** crypto 提现回调：先入 Processing 记录，8s 后 mock 转为 Sent（TODO(backend): 后端回执驱动） */
  const onCryptoWithdraw = (amountUsd: string, address: string, token: string) => {
    const id = `wd-${Date.now().toString(36)}`;
    setTransactions((prev) => [
      {
        id,
        date: "Oct 19, 2026",
        type: "Withdrawal",
        amount: `-$${amountUsd}`,
        fee: "$0.00",
        method: `Crypto ${token} ${address.slice(0, 8)}…`,
        status: "Processing",
      },
      ...prev,
    ]);
    setTimeout(() => {
      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: "Sent" } : t)),
      );
    }, 8000);
  };

  const submitRefund = () => {
    // TODO(backend): 提交真实退款申请
    if (!refundAmount) return;
    setRefunds((prev) => [
      {
        id: `rf-${Date.now().toString(36)}`,
        date: "Oct 14, 2026",
        amount: `$${refundAmount}`,
        reason: refundReason || "User refund request",
        status: "Processing",
      },
      ...prev,
    ]);
    setRefundOpen(false);
    setRefundAmount("");
    setRefundReason("");
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
              <CryptoTopup onPaid={onCryptoPaid} />
            ) : (
              <Button
                className="mt-4 w-full"
                onClick={() => alert("Payments not wired yet (TODO(backend))")}
              >
                Add Credits
              </Button>
            )}
            <div className="mt-3 flex justify-between text-sm">
              <Link href="/activity" className="flex items-center gap-1 hover:underline">
                View Usage <ExternalLink className="size-3" />
              </Link>
              <button
                className="hover:underline"
                onClick={() => alert("Promo codes not wired yet (TODO(backend))")}
              >
                Redeem Promo Code
              </button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <h2 className="font-semibold">Auto Top-Up</h2>
            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={() => alert("Payment methods not wired yet (TODO(backend))")}
            >
              Add a Payment Method
            </Button>
            <p className="mt-3 text-sm text-muted-foreground">
              To activate auto-top-up, you&apos;ll need a payment method that
              supports offline charging.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Crypto 提现（出金到钱包，自有功能；含 rail-consistency 风控） */}
      <Card className="mt-4">
        <CardContent className="pt-6">
          <h2 className="font-semibold">Withdraw to Wallet</h2>
          <div className="mt-4">
            <CryptoWithdraw
              withdrawable={cryptoWithdrawable(visibleTx)}
              onWithdraw={onCryptoWithdraw}
            />
          </div>
        </CardContent>
      </Card>

      <h2 className="mt-10 text-lg font-bold">Recent Transactions</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Need enterprise billing options?{" "}
        <Link href="#" className="underline underline-offset-4">
          Contact sales
        </Link>
      </p>
      {/* TODO(backend): 真实交易流水 */}
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
            {visibleTx.map((t) => (
              <tr key={t.id} className="border-b last:border-0">
                <td className="p-3 text-muted-foreground">{t.date}</td>
                <td className="p-3">{t.type}</td>
                <td className="p-3">{t.amount}</td>
                <td className="p-3 text-muted-foreground">{t.fee}</td>
                <td className="p-3 text-muted-foreground">{t.method}</td>
                <td className="p-3">
                  <Badge variant="secondary">{t.status}</Badge>
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
                <td className="p-3 text-muted-foreground">{r.date}</td>
                <td className="p-3">{r.amount}</td>
                <td className="p-3 text-muted-foreground">{r.reason}</td>
                <td className="p-3">
                  <Badge
                    className={
                      r.status === "Refunded to original payment method"
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                    }
                  >
                    {r.status}
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
