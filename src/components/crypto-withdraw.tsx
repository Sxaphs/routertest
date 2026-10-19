"use client";

import { useState } from "react";
import { ArrowUpFromLine, Info, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ConnectedChip,
  WalletPicker,
  useWalletConnection,
} from "@/components/wallet-connect";

/**
 * Crypto 提现面板：余额提回钱包。
 * 风控（rail-consistency）：仅 crypto 入金部分可提现到钱包；
 * 法币入金只能走原路退款（Refunds）。提交前需二次确认（mock 邮箱验证码）。
 * 真实链路 TODO(backend)：后端审核 → 热钱包打款 → 链上回执。
 */
export function CryptoWithdraw({
  withdrawable,
  onWithdraw,
}: {
  withdrawable: number;
  onWithdraw?: (amountUsd: string, address: string, token: string) => void;
}) {
  const { conn, connecting, error, connect, disconnect } = useWalletConnection();
  const [amount, setAmount] = useState("25");
  const [token, setToken] = useState("USDC");
  const [chain, setChain] = useState("ethereum");
  const [manualAddress, setManualAddress] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const address = conn?.address ?? manualAddress.trim();
  const amountN = Number(amount) || 0;
  const overLimit = amountN > withdrawable;
  const valid =
    amountN > 0 && !overLimit && address.length >= 8 && withdrawable > 0;

  const confirm = async () => {
    setSubmitting(true);
    // TODO(backend): 校验邮箱验证码 → 创建提现申请 → 风控审核 → 热钱包打款
    await new Promise((r) => setTimeout(r, 600));
    onWithdraw?.(amount, address, token);
    setSubmitting(false);
    setConfirmOpen(false);
    setDone(true);
  };

  if (done) {
    return (
      <div className="rounded-md bg-emerald-500/10 p-3 text-sm">
        <p className="font-medium text-emerald-600 dark:text-emerald-400">
          Withdrawal requested
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          ${amount} {token} → <code>{address.slice(0, 10)}…</code> — track its
          status in Recent Transactions below (mock).
        </p>
      </div>
    );
  }

  // 风控：无 crypto 来源余额时整体置灰并说明规则（法币用户引导去 Refunds）
  if (withdrawable <= 0) {
    return (
      <div className="rounded-md border border-dashed p-3 text-sm">
        <p className="flex items-center gap-1.5 font-medium">
          <ShieldCheck className="size-4 text-primary" />
          No crypto-withdrawable balance
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Only balance topped up via crypto can be withdrawn to a wallet. Card
          deposits can be refunded to the original payment method — see Refunds
          below.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* 风控提示：可提现额度（crypto 来源分层） */}
      <p className="flex items-center gap-1.5 text-sm">
        <ShieldCheck className="size-4 text-primary" />
        Crypto-withdrawable: <b>${withdrawable.toFixed(2)}</b>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="size-3.5 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-72">
              Only balance topped up via crypto can be withdrawn to a wallet.
              Fiat top-ups are refundable to the original payment method only
              (rail consistency).
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </p>

      {!conn ? (
        <WalletPicker connecting={connecting} error={error} onConnect={connect} />
      ) : (
        <ConnectedChip conn={conn} onDisconnect={disconnect} />
      )}

      {!conn && (
        <div>
          <label className="text-xs text-muted-foreground" htmlFor="wd-address">
            Or enter a destination address manually
          </label>
          <Input
            id="wd-address"
            value={manualAddress}
            onChange={(e) => setManualAddress(e.target.value)}
            placeholder="0x… / Solana address"
            className="font-mono"
          />
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-xs text-muted-foreground" htmlFor="wd-amount">
            Amount (USD)
          </label>
          <Input
            id="wd-amount"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Token</label>
          <Select value={token} onValueChange={setToken}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="USDC">USDC</SelectItem>
              <SelectItem value="USDT">USDT</SelectItem>
              <SelectItem value="ETH">ETH</SelectItem>
              <SelectItem value="SOL">SOL</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Network</label>
          <Select value={chain} onValueChange={setChain}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ethereum">Ethereum</SelectItem>
              <SelectItem value="polygon">Polygon</SelectItem>
              <SelectItem value="bsc">BNB Chain</SelectItem>
              <SelectItem value="solana">Solana</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {overLimit && (
        <p className="text-sm text-destructive" role="alert">
          Exceeds your crypto-withdrawable balance (${withdrawable.toFixed(2)}).
          Only crypto-sourced funds can be withdrawn to a wallet.
        </p>
      )}

      <Button
        className="w-full"
        variant="outline"
        disabled={!valid}
        onClick={() => setConfirmOpen(true)}
      >
        <ArrowUpFromLine className="mr-2 size-4" />
        Withdraw ${amount || "0"} {token}
      </Button>
      <p className="text-xs text-muted-foreground">
        Withdrawals are risk-reviewed and paid out from the platform hot wallet
        (mock, TODO(backend)).
      </p>

      {/* 二次确认（风控：确认信息 + mock 邮箱验证码） */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm withdrawal</DialogTitle>
            <DialogDescription>
              Review the details carefully. Crypto transfers are irreversible.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="rounded-lg border p-3 space-y-1">
              <p><b>${amount} {token}</b> on {chain}</p>
              <p className="break-all font-mono text-xs text-muted-foreground">
                to {address}
              </p>
            </div>
            <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-primary" />
              Rail consistency: this payout comes from your crypto-sourced
              balance only. First-time destinations may be held for review.
            </p>
            <div>
              <label className="text-sm" htmlFor="wd-code">
                Email verification code (mock: any 6 digits work)
              </label>
              <Input
                id="wd-code"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="6-digit code"
                className="font-mono tracking-widest"
              />
            </div>
            <Button
              className="w-full"
              disabled={code.trim().length === 0 || submitting}
              onClick={confirm}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                "Confirm withdrawal"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
