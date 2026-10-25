"use client";

import { PaymentSheet } from "@/components/payment-sheet";
import type { IntentStatus, TopupIntent } from "@/lib/payments";

/**
 * Crypto 充值面板（credits 页 Use crypto 开启时渲染）。
 * 主通道为 Stripe 稳定币支付（USDC）：钱包签名在 Stripe 托管收银流程内完成，
 * 前端不再构造链上交易。MVP 仅 USDC，单笔上限 $10,000（PaymentSheet 内校验）。
 * TODO(backend): 真实集成见 src/lib/payments/stripe.ts stub。
 */
export function CryptoTopup({
  onStatus,
}: {
  onStatus?: (intent: TopupIntent, status: IntentStatus) => void;
}) {
  return (
    <div className="mt-4 rounded-lg border p-4">
      <p className="mb-3 text-sm font-medium">Pay with crypto (USDC)</p>
      <PaymentSheet rail="crypto" onStatus={onStatus} />
    </div>
  );
}
