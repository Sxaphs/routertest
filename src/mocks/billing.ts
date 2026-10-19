/** 账单/充值/退款相关 mock。TODO(backend): 接 OURBRAND 账单与支付 */

export interface Transaction {
  id: string;
  date: string;
  type: "Top-up" | "Usage" | "Refund" | "Withdrawal";
  amount: string; // 含符号，如 "+$50.00"
  /** 实付手续费（里程碑一新增列） */
  fee: string;
  method: string;
  status: string;
}

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-1001",
    date: "Oct 2, 2026",
    type: "Top-up",
    amount: "+$50.00",
    fee: "$1.65",
    method: "Visa •• 4242",
    status: "Completed",
  },
  {
    id: "tx-1002",
    date: "Oct 9, 2026",
    type: "Top-up",
    amount: "+$100.00",
    fee: "$3.05",
    method: "USDC",
    status: "Completed",
  },
  {
    id: "tx-1003",
    date: "Oct 12, 2026",
    type: "Usage",
    amount: "-$12.40",
    fee: "—",
    method: "API usage",
    status: "Completed",
  },
];

export interface Refund {
  id: string;
  date: string;
  amount: string;
  reason: string;
  status: "Processing" | "Refunded to original payment method";
}

export const MOCK_REFUNDS: Refund[] = [
  {
    id: "rf-101",
    date: "Sep 28, 2026",
    amount: "$20.00",
    reason: "Accidental top-up",
    status: "Refunded to original payment method",
  },
  {
    id: "rf-102",
    date: "Oct 11, 2026",
    amount: "$15.50",
    reason: "Service disruption credit",
    status: "Processing",
  },
];

/** 判断一笔流水的支付方式是否为 crypto 通道（入金分层依据） */
export const isCryptoMethod = (method: string): boolean =>
  /crypto|usdc|usdt|eth|sol/i.test(method);

/** 风控：资金来源一致性（rail-consistency）。
 * crypto 入金只能提现到 crypto 钱包；法币入金只能原路退款。
 * 可提现额度 = crypto 入金 − crypto 提现（均按流水 method 判断）。
 * TODO(backend): 该分层必须由后端在账本层保证，前端仅展示。
 */
export function cryptoWithdrawable(transactions: Transaction[]): number {
  let v = 0;
  for (const t of transactions) {
    const n = Number(t.amount.replace(/[+$,]/g, ""));
    if (!Number.isFinite(n)) continue;
    if (t.type === "Top-up" && isCryptoMethod(t.method)) v += n;
    if (t.type === "Withdrawal") v -= n;
  }
  return Math.max(0, Math.round(v * 100) / 100);
}
