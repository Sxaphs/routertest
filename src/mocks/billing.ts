/** 账单/充值/退款相关 mock。TODO(backend): 接 OURBRAND 账单与支付 */

import type { TxStatus } from "@/lib/format";
import type {
  IntentStatus,
  PaymentRail,
  SavedPaymentMethod,
  TopupIntent,
} from "@/lib/payments";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------- 交易流水

export interface Transaction {
  id: string;
  /** ISO8601 UTC */
  createdAt: string;
  type: "Top-up" | "Usage" | "Refund";
  /** 无符号十进制字符串；符号由 type 决定（Top-up/Refund 入，Usage 出） */
  amount: string;
  currency: string;
  /** 实付手续费（十进制字符串） */
  fee: string;
  method: string;
  status: TxStatus;
}

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-1001",
    createdAt: "2026-10-02T09:15:00Z",
    type: "Top-up",
    amount: "50.00",
    currency: "USD",
    fee: "1.65",
    method: "Visa •• 4242",
    status: "completed",
  },
  {
    id: "tx-1002",
    createdAt: "2026-10-09T14:40:00Z",
    type: "Top-up",
    amount: "100.00",
    currency: "USD",
    fee: "3.05",
    method: "USDC",
    status: "completed",
  },
  {
    id: "tx-1003",
    createdAt: "2026-10-12T18:02:00Z",
    type: "Usage",
    amount: "12.40",
    currency: "USD",
    fee: "0.00",
    method: "API usage",
    status: "completed",
  },
];

// ---------------------------------------------------------------- 退款

export interface Refund {
  id: string;
  /** ISO8601 UTC */
  createdAt: string;
  /** 十进制字符串 */
  amount: string;
  currency: string;
  reason: string;
  status: Extract<TxStatus, "processing" | "refunded">;
}

export const MOCK_REFUNDS: Refund[] = [
  {
    id: "rf-101",
    createdAt: "2026-09-28T11:00:00Z",
    amount: "20.00",
    currency: "USD",
    reason: "Accidental top-up",
    status: "refunded",
  },
  {
    id: "rf-102",
    createdAt: "2026-10-11T16:30:00Z",
    amount: "15.50",
    currency: "USD",
    reason: "Service disruption credit",
    status: "processing",
  },
];

// ---------------------------------------------------------------- 风控：资金来源一致性

/**
 * 出金策略（产品决策）：所有出金 = 原路退款（卡退卡、USDC 退 Stripe 关联原支付钱包），
 * 不支持提现到任意钱包——通道一致性天然成立，无需分层额度。
 * 「Withdraw to Wallet」功能已从前端移除（恢复见 git 历史）。
 */

// ---------------------------------------------------------------- 充值 intent（Stripe 收银台模式）

/** crypto 充值单笔上限（美元）；超限前端拦截并提示拆单 */
export const CRYPTO_TOPUP_LIMIT_USD = 10_000;

const intentPolls = new Map<string, number>();

/** 创建充值意图（mock）。
 * TODO(backend): POST /v1/billing/topup（法币）或 /v1/billing/topup/crypto（USDC），
 * 响应 { intentId, clientSecret, amount, currency }；不再有「收款地址」概念。
 */
export async function createTopupIntent({
  amountUsd,
  rail,
}: {
  amountUsd: string;
  rail: PaymentRail;
}): Promise<TopupIntent> {
  await delay(400);
  const intentId = `pi_mock_${Math.random().toString(36).slice(2, 10)}`;
  intentPolls.set(intentId, 0);
  return {
    intentId,
    clientSecret: `${intentId}_secret_${Math.random().toString(36).slice(2, 8)}`,
    amount: Number(amountUsd).toFixed(2),
    currency: "USD",
    rail,
  };
}

/** 轮询入账状态（mock：前 2 次 confirming，第 3 次 credited）。
 * TODO(backend): GET /v1/billing/topup/crypto/{intentId}；正式入账以 webhook 为准。
 */
export async function pollTopupIntent(intentId: string): Promise<IntentStatus> {
  await delay(300);
  const n = (intentPolls.get(intentId) ?? 0) + 1;
  intentPolls.set(intentId, n);
  return n >= 3 ? "credited" : "confirming";
}

// ---------------------------------------------------------------- 推广码

/** 兑换推广码（mock：WELCOME → +$5.00）。
 * TODO(backend): POST /v1/billing/promo-codes/redeem
 */
export async function redeemPromoCode(code: string): Promise<{ credit: string }> {
  await delay(400);
  if (code.trim().toUpperCase() === "WELCOME") return { credit: "5.00" };
  throw new Error("Invalid or expired promo code");
}

// ---------------------------------------------------------------- 支付方式

let mockMethods: SavedPaymentMethod[] = [
  { id: "pm_mock_4242", brand: "visa", last4: "4242", expMonth: 12, expYear: 2027 },
];

/** TODO(backend): GET /v1/billing/payment-methods */
export async function listMockPaymentMethods(): Promise<SavedPaymentMethod[]> {
  await delay(200);
  return [...mockMethods];
}

/** TODO(backend): POST /v1/billing/payment-methods（真实版走 Stripe SetupIntent） */
export async function addMockPaymentMethod(): Promise<SavedPaymentMethod> {
  await delay(400);
  const pm: SavedPaymentMethod = {
    id: `pm_mock_${Math.random().toString(36).slice(2, 6)}`,
    brand: "visa",
    last4: "5555",
    expMonth: 8,
    expYear: 2028,
  };
  mockMethods = [...mockMethods, pm];
  return pm;
}

/** TODO(backend): DELETE /v1/billing/payment-methods/{id} */
export async function deleteMockPaymentMethod(id: string): Promise<void> {
  await delay(300);
  mockMethods = mockMethods.filter((m) => m.id !== id);
}
