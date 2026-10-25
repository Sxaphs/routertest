"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2, Lock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatMoney } from "@/lib/format";
import {
  paymentProvider,
  type IntentStatus,
  type PaymentRail,
  type TopupIntent,
} from "@/lib/payments";
import { CRYPTO_TOPUP_LIMIT_USD } from "@/mocks/billing";

/**
 * Stripe 收银台（占位实现，接口形状已对齐）。
 * 流程：输入金额（crypto 单笔上限 $10,000）→ 创建 intent → 收银区 → 轮询入账。
 * 占位收银区在真实集成时替换为 @stripe/react-stripe-js 的 <PaymentElement />
 * （clientSecret 已就位，见 lib/payments/stripe.ts stub，TODO(backend)）。
 */
export function PaymentSheet({
  rail,
  defaultAmount = "50",
  onStatus,
}: {
  rail: PaymentRail;
  defaultAmount?: string;
  /** intent 状态变化回调（confirming → credited / failed），驱动交易表 */
  onStatus?: (intent: TopupIntent, status: IntentStatus) => void;
}) {
  const [amount, setAmount] = useState(defaultAmount);
  const [intent, setIntent] = useState<TopupIntent | null>(null);
  const [phase, setPhase] = useState<
    "amount" | "creating" | "checkout" | "polling" | "credited" | "failed"
  >("amount");
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const amountN = Number(amount) || 0;
  const overLimit = rail === "crypto" && amountN > CRYPTO_TOPUP_LIMIT_USD;
  const amountValid = amountN > 0 && !overLimit;

  useEffect(() => () => {
    if (pollTimer.current) clearTimeout(pollTimer.current);
  }, []);

  const createIntent = async () => {
    if (!amountValid) return;
    setPhase("creating");
    // TODO(backend): POST /v1/billing/topup（法币）或 /v1/billing/topup/crypto（USDC）
    const it = await paymentProvider.createIntent({ amountUsd: amount, rail });
    setIntent(it);
    setPhase("checkout");
  };

  const submitPayment = async () => {
    if (!intent) return;
    setPhase("polling");
    onStatus?.(intent, "confirming");
    // TODO(backend): 真实版在 <PaymentElement> 内 confirmPayment，轮询仅作 UI 确认
    const tick = async () => {
      const status = await paymentProvider.pollIntent(intent.intentId);
      onStatus?.(intent, status);
      if (status === "confirming") {
        pollTimer.current = setTimeout(tick, 2000);
      } else {
        setPhase(status); // credited | failed
      }
    };
    await tick();
  };

  const reset = () => {
    setIntent(null);
    setPhase("amount");
  };

  if (phase === "credited" && intent) {
    return (
      <div className="rounded-md bg-emerald-500/10 p-3 text-sm">
        <p className="flex items-center gap-2 font-medium text-emerald-600 dark:text-emerald-400">
          <Check className="size-4" /> Payment credited
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {formatMoney(intent.amount, intent.currency)}
          {intent.rail === "crypto" ? " (USDC)" : ""} added to your balance —
          see Recent Transactions below.
        </p>
        <Button variant="ghost" size="sm" className="mt-2" onClick={reset}>
          Make another payment
        </Button>
      </div>
    );
  }

  if (phase === "failed") {
    return (
      <div className="rounded-md bg-destructive/10 p-3 text-sm">
        <p className="flex items-center gap-2 font-medium text-destructive">
          <XCircle className="size-4" /> Payment failed
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          No charge was made. Please try again.
        </p>
        <Button variant="ghost" size="sm" className="mt-2" onClick={reset}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-muted-foreground" htmlFor={`ps-amount-${rail}`}>
          Amount (USD){rail === "crypto" ? " — paid in USDC" : ""}
        </label>
        <Input
          id={`ps-amount-${rail}`}
          inputMode="decimal"
          value={amount}
          disabled={phase !== "amount"}
          onChange={(e) => setAmount(e.target.value)}
        />
        {overLimit && (
          <p className="mt-1 text-sm text-destructive" role="alert">
            Single crypto top-up limit is {formatMoney(CRYPTO_TOPUP_LIMIT_USD)}.
            Please split larger amounts into multiple payments.
          </p>
        )}
      </div>

      {phase === "amount" || phase === "creating" ? (
        <Button
          className="w-full"
          disabled={!amountValid || phase === "creating"}
          onClick={createIntent}
        >
          {phase === "creating" ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Preparing checkout…
            </>
          ) : (
            <>Continue to payment</>
          )}
        </Button>
      ) : (
        <>
          {/* Stripe 收银占位区：真实版此处挂载 <PaymentElement />（TODO(backend)） */}
          <div className="space-y-2 rounded-md border border-dashed p-3">
            <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Lock className="size-3.5" />
              Stripe secure checkout — {rail === "crypto" ? "USDC" : "card"}
            </p>
            <div className="rounded border bg-muted/50 px-3 py-2 font-mono text-xs text-muted-foreground">
              {rail === "crypto"
                ? "Wallet signature happens inside Stripe checkout"
                : "•••• •••• •••• 4242   12 / 27   CVC •••"}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Placeholder for Stripe PaymentElement (TODO(backend)). intent:{" "}
              <code>{intent?.intentId}</code>
            </p>
          </div>
          <Button
            className="w-full"
            disabled={phase === "polling"}
            onClick={submitPayment}
          >
            {phase === "polling" ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Confirming payment…
              </>
            ) : (
              <>
                Pay {formatMoney(amountN)}
                {rail === "crypto" ? " in USDC" : ""}
              </>
            )}
          </Button>
        </>
      )}

      <p className="text-xs text-muted-foreground">
        {rail === "crypto"
          ? "Credits land automatically after payment confirmation (mock polling for now, TODO(backend))."
          : "Processed by Stripe. Credits land automatically after confirmation (mock for now, TODO(backend))."}
      </p>
    </div>
  );
}
