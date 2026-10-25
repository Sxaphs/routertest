/**
 * 运营后台（/admin/*）全部确定性 mock（刷新不变）。TODO(backend): 接真实运营接口。
 * 金额一律数值 + currency（格式化走 src/lib/format.ts）；时间为 ISO8601 UTC 字符串。
 */

/* ---------- 审核队列（/admin/reviews） ---------- */

export interface AuditEntry {
  /** ISO8601 UTC */
  at: string;
  actor: string;
  action: string;
  reason?: string;
}

export interface WithdrawalDetail {
  kind: "crypto_withdrawal";
  /** 完整收款地址（必须完整展示） */
  address: string;
  token: string;
  chain: string;
  /** rail-consistency 校验：该用户 crypto 可提现额度（美元） */
  withdrawableUsd: number;
  /** 邮箱二次验证是否已通过 */
  emailVerified: boolean;
}

export interface RefundDetail {
  kind: "refund";
  originalMethod: string;
  /** 该笔充值已消费比例（%） */
  consumedPct: number;
  /** 近 30 天退款次数 */
  refunds30d: number;
  /** 账号年龄（天） */
  accountAgeDays: number;
}

export type ReviewStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "awaiting_payout"
  | "sent"
  | "refunded";

export interface Review {
  id: string;
  type: "crypto_withdrawal" | "refund";
  status: ReviewStatus;
  user: string;
  amount: number;
  currency: string;
  createdAt: string;
  riskFlags: string[];
  detail: WithdrawalDetail | RefundDetail;
  auditTrail: AuditEntry[];
}

export const REVIEW_STATUS_LABELS: Record<ReviewStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  awaiting_payout: "Awaiting payout",
  sent: "Sent",
  refunded: "Refunded",
};

/** 当前操作人（mock）。TODO(backend): 来自 GET /v1/auth/session */
export const CURRENT_ADMIN = "admin@ourbrand.io";

/* ---------- 全局操作日志（/admin/audit） ---------- */

export interface AuditLogEntry {
  /** ISO8601 UTC */
  at: string;
  actor: string;
  area: "review" | "reconciliation" | "dispute" | "payout";
  action: string;
  /** 操作对象（审核单号 / 用户 / 队列等） */
  target: string;
  reason?: string;
}

/**
 * 全局操作日志：模块级内存存储 + 订阅（跨页面共享，会话内追加）。
 * 种子数据为确定性历史记录（刷新后恢复种子）。TODO(backend): GET /v1/admin/audit-log
 */
let auditLog: AuditLogEntry[] = [
  { at: "2026-10-19T16:02:00Z", actor: CURRENT_ADMIN, area: "review", action: "Approved", target: "rv-8990", reason: "Regular user, address matches payout history" },
  { at: "2026-10-18T09:12:00Z", actor: CURRENT_ADMIN, area: "review", action: "Approved", target: "rv-8971" },
  { at: "2026-10-18T09:40:00Z", actor: CURRENT_ADMIN, area: "payout", action: "Payout sent", target: "rv-8971", reason: "tx 0x9ac4…f21e" },
  { at: "2026-10-17T14:30:00Z", actor: CURRENT_ADMIN, area: "review", action: "Rejected", target: "rv-8960", reason: "96% of the top-up already consumed; repeated refund pattern" },
];

const auditListeners = new Set<() => void>();

export function getAuditLog(): AuditLogEntry[] {
  return auditLog;
}

export function appendAuditLog(entry: AuditLogEntry): void {
  auditLog = [entry, ...auditLog];
  auditListeners.forEach((cb) => cb());
}

export function subscribeAuditLog(cb: () => void): () => void {
  auditListeners.add(cb);
  return () => auditListeners.delete(cb);
}

export const MOCK_REVIEWS: Review[] = [
  {
    id: "rv-9001",
    type: "crypto_withdrawal",
    status: "pending",
    user: "0xdev@proton.me",
    amount: 250,
    currency: "USD",
    createdAt: "2026-10-20T09:30:00Z", // >24h → SLA 高亮
    riskFlags: ["First-time withdrawal address"],
    detail: {
      kind: "crypto_withdrawal",
      address: "0x7f3B9a2C4dE5F60718293a4Bc5D6e7F8091a2B3c",
      token: "USDC",
      chain: "Ethereum",
      withdrawableUsd: 300,
      emailVerified: true,
    },
    auditTrail: [],
  },
  {
    id: "rv-9002",
    type: "refund",
    status: "pending",
    user: "lena@example.com",
    amount: 45.5,
    currency: "USD",
    createdAt: "2026-10-22T06:10:00Z",
    riskFlags: ["3 refunds in 30 days"],
    detail: {
      kind: "refund",
      originalMethod: "Visa •• 4242",
      consumedPct: 12,
      refunds30d: 3,
      accountAgeDays: 412,
    },
    auditTrail: [],
  },
  {
    id: "rv-9003",
    type: "crypto_withdrawal",
    status: "pending",
    user: "quant@example.org",
    amount: 980,
    currency: "USD",
    createdAt: "2026-10-21T20:05:00Z",
    riskFlags: ["First-time withdrawal address", "Near daily limit"],
    detail: {
      kind: "crypto_withdrawal",
      address: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
      token: "USDC",
      chain: "Solana",
      withdrawableUsd: 1200,
      emailVerified: true,
    },
    auditTrail: [],
  },
  {
    id: "rv-9004",
    type: "refund",
    status: "pending",
    user: "newbie@example.net",
    amount: 10,
    currency: "USD",
    createdAt: "2026-10-22T11:45:00Z",
    riskFlags: ["Account younger than 7 days"],
    detail: {
      kind: "refund",
      originalMethod: "USDC via Stripe",
      consumedPct: 0,
      refunds30d: 1,
      accountAgeDays: 3,
    },
    auditTrail: [],
  },
  {
    id: "rv-8990",
    type: "crypto_withdrawal",
    status: "awaiting_payout",
    user: "market@example.io",
    amount: 500,
    currency: "USD",
    createdAt: "2026-10-19T15:20:00Z",
    riskFlags: [],
    detail: {
      kind: "crypto_withdrawal",
      address: "0xA11CE5Ee00000000000000000000000000C0ffEE",
      token: "USDC",
      chain: "Polygon",
      withdrawableUsd: 640,
      emailVerified: true,
    },
    auditTrail: [
      {
        at: "2026-10-19T16:02:00Z",
        actor: "admin@ourbrand.io",
        action: "Approved",
        reason: "Regular user, address matches payout history",
      },
    ],
  },
  {
    id: "rv-8971",
    type: "crypto_withdrawal",
    status: "sent",
    user: "hodl@example.com",
    amount: 1200,
    currency: "USD",
    createdAt: "2026-10-18T08:00:00Z",
    riskFlags: [],
    detail: {
      kind: "crypto_withdrawal",
      address: "0xB0B000000000000000000000000000000000dEaD",
      token: "USDC",
      chain: "Ethereum",
      withdrawableUsd: 1500,
      emailVerified: true,
    },
    auditTrail: [
      { at: "2026-10-18T09:12:00Z", actor: "admin@ourbrand.io", action: "Approved" },
      {
        at: "2026-10-18T09:40:00Z",
        actor: "admin@ourbrand.io",
        action: "Payout sent",
        reason: "tx 0x9ac4…f21e",
      },
    ],
  },
  {
    id: "rv-8960",
    type: "refund",
    status: "rejected",
    user: "abuse@example.net",
    amount: 200,
    currency: "USD",
    createdAt: "2026-10-17T13:00:00Z",
    riskFlags: ["5 refunds in 30 days", "Account younger than 7 days"],
    detail: {
      kind: "refund",
      originalMethod: "Visa •• 4242",
      consumedPct: 96,
      refunds30d: 5,
      accountAgeDays: 6,
    },
    auditTrail: [
      {
        at: "2026-10-17T14:30:00Z",
        actor: "admin@ourbrand.io",
        action: "Rejected",
        reason: "96% of the top-up already consumed; repeated refund pattern",
      },
    ],
  },
];

/* ---------- 每日对账（/admin/reconciliation） ---------- */

export interface ReconDay {
  /** ISO8601 UTC（当天 00:00） */
  date: string;
  /** Stripe 报表金额 */
  stripe: number;
  /** 内部账本 */
  ledger: number;
  /** 银行/链上实际 */
  actual: number;
}

/** 确定性生成 14 天对账数据；两天有差异（10-14 少 128.40，10-20 多 37.12） */
export const MOCK_RECON_DAYS: ReconDay[] = Array.from({ length: 14 }, (_, i) => {
  const day = 8 + i; // 2026-10-08 .. 2026-10-21
  const stripe = Math.round((18000 + i * 137.29) * 100) / 100;
  const ledger = stripe;
  let actual = stripe;
  if (day === 14) actual = Math.round((stripe - 128.4) * 100) / 100;
  if (day === 20) actual = Math.round((stripe + 37.12) * 100) / 100;
  return {
    date: `2026-10-${String(day).padStart(2, "0")}T00:00:00Z`,
    stripe,
    ledger,
    actual,
  };
});

export const RECON_META = {
  /** 最近一次对账时间 */
  lastRunAt: "2026-10-22T00:30:00Z",
  /** 连续平账天数（10-20 有差异 → 仅 10-21 一天） */
  consecutiveBalancedDays: 1,
};

/** 差异总额 ≠ 0 时自动冻结出金队列（初始状态由数据推导） */
export const reconDiffTotal = (days: ReconDay[]): number =>
  Math.round(days.reduce((s, d) => s + Math.abs(d.ledger - d.actual), 0) * 100) / 100;

/* ---------- 运维底线面板（/admin/overview） ---------- */

/** 告警阈值（写死的 mock 配置，TODO(backend): 后台可配） */
export const OPS_THRESHOLDS = {
  /** 对账差异（美元），>0 告警 */
  reconDiffUsd: 0,
  /** 入账延迟（确认→入账）告警阈值，分钟 */
  creditingLatencyMin: 10,
  /** webhook 连续验签失败次数告警阈值 */
  webhookSigFailures: 3,
  /** 出金流动性健康度 = Stripe payout 账户余额/单日限额，低于该值告警（目标 2–3 倍） */
  payoutMinRatio: 2,
  /** 审核队列积压告警阈值（pending 条数） */
  reviewBacklog: 20,
} as const;

export interface OpsMetric {
  id: string;
  title: string;
  value: string;
  status: "ok" | "warn";
  hint: string;
}

export const MOCK_OPS_METRICS: OpsMetric[] = [
  {
    id: "recon",
    title: "Reconciliation diff",
    value: "$165.52",
    status: "warn",
    hint: "Non-zero diff in the last 14 days — payout queue auto-frozen",
  },
  {
    id: "latency",
    title: "Crediting latency",
    value: "4.2 min avg",
    status: "ok",
    hint: "Confirm → credited; alert threshold 10 min",
  },
  {
    id: "webhook",
    title: "Webhook signature failures",
    value: "0 in a row",
    status: "ok",
    hint: "Alert at 3 consecutive verification failures",
  },
  {
    id: "payout",
    title: "Payout liquidity (Stripe)",
    value: "1.6× daily limit",
    status: "warn",
    hint: "Ethereum payout balance below 2× target — top up the Stripe payout account",
  },
  {
    id: "backlog",
    title: "Review queue backlog",
    value: "4 pending",
    status: "ok",
    hint: "Alert at 20 pending reviews",
  },
];

/** Stripe 出金账户（按链的 USDC 可用额度；gas 由 Stripe 托管，无需平台操心） */
export interface PayoutAccount {
  chain: string;
  usdcBalance: number;
  dailyLimitUsd: number;
}

export const MOCK_PAYOUT_ACCOUNTS: PayoutAccount[] = [
  { chain: "Ethereum", usdcBalance: 32000, dailyLimitUsd: 20000 },
  { chain: "Solana", usdcBalance: 45000, dailyLimitUsd: 15000 },
  { chain: "Polygon", usdcBalance: 8000, dailyLimitUsd: 5000 },
];

/* ---------- Stripe 拒付（/admin/disputes） ---------- */

export interface Dispute {
  id: string;
  user: string;
  amount: number;
  currency: string;
  reason: string;
  status: "open" | "evidence_submitted" | "won" | "lost";
  /** 证据提交截止（ISO8601 UTC） */
  dueAt: string;
}

export const DISPUTE_STATUS_LABELS: Record<Dispute["status"], string> = {
  open: "Open",
  evidence_submitted: "Evidence submitted",
  won: "Won",
  lost: "Lost",
};

export const MOCK_DISPUTES: Dispute[] = [
  {
    id: "dp-301",
    user: "chargeback@example.net",
    amount: 230,
    currency: "USD",
    reason: "Fraudulent",
    status: "open",
    dueAt: "2026-10-24T00:00:00Z", // <48h → 红色倒计时
  },
  {
    id: "dp-302",
    user: "lena@example.com",
    amount: 45.5,
    currency: "USD",
    reason: "Product not received",
    status: "open",
    dueAt: "2026-10-29T00:00:00Z",
  },
  {
    id: "dp-288",
    user: "quant@example.org",
    amount: 120,
    currency: "USD",
    reason: "Unrecognized",
    status: "evidence_submitted",
    dueAt: "2026-10-26T00:00:00Z",
  },
  {
    id: "dp-270",
    user: "hodl@example.com",
    amount: 89,
    currency: "USD",
    reason: "Fraudulent",
    status: "won",
    dueAt: "2026-10-10T00:00:00Z",
  },
];

/** 争议率（本月争议数 / 总交易数）。>0.9% 触发红色告警线 */
export const DISPUTE_RATE = { disputesThisMonth: 3, totalTransactions: 418, alertPct: 0.9 };
