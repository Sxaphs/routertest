/**
 * 支付适配层：页面组件只依赖 PaymentProvider 接口。
 * 当前实现为 mock；真实 Stripe 实现见 stripe.ts（stub，TODO(backend)）。
 * 换支付商（Coinbase Business / NOWPayments 等）时新增实现即可，页面不动。
 */
import type { TxStatus } from "@/lib/format";

export type PaymentRail = "fiat" | "crypto";

/** 充值意图（对应 POST /v1/billing/topup[/crypto] 响应） */
export interface TopupIntent {
  intentId: string;
  clientSecret: string;
  /** 十进制字符串，如 "50.00" */
  amount: string;
  currency: string;
  rail: PaymentRail;
}

/** 入账状态机：confirming → credited / failed（TxStatus 子集） */
export type IntentStatus = Extract<TxStatus, "confirming" | "credited" | "failed">;

export interface SavedPaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
}

export interface PaymentProvider {
  createIntent(input: { amountUsd: string; rail: PaymentRail }): Promise<TopupIntent>;
  pollIntent(intentId: string): Promise<IntentStatus>;
  listPaymentMethods(): Promise<SavedPaymentMethod[]>;
  addPaymentMethod(): Promise<SavedPaymentMethod>;
  deletePaymentMethod(id: string): Promise<void>;
}

export { MockPaymentProvider } from "./mock";

import { MockPaymentProvider } from "./mock";

/** 全局当前实现。TODO(backend): 接 Stripe 后换成 StripePaymentProvider */
export const paymentProvider: PaymentProvider = new MockPaymentProvider();
