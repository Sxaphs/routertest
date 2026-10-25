/**
 * 统一金额/时间格式化（契约：后端金额 = 十进制字符串 + currency，时间 = ISO8601 UTC）。
 * 展示文案归前端：状态枚举码在这里映射为文案。
 */

/** 交易/退款状态枚举码（后端契约；展示用 TX_STATUS_LABELS 映射） */
export type TxStatus =
  | "confirming"
  | "credited"
  | "failed"
  | "processing"
  | "sent"
  | "completed"
  | "refunded";

export const TX_STATUS_LABELS: Record<TxStatus, string> = {
  confirming: "Confirming",
  credited: "Credited",
  failed: "Failed",
  processing: "Processing",
  sent: "Sent",
  completed: "Completed",
  refunded: "Refunded",
};

/** 十进制字符串/数值 → 本地化货币文本，如 "50.00" → "$50.00" */
export function formatMoney(amount: string | number, currency = "USD"): string {
  const n = typeof amount === "number" ? amount : Number(amount);
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(n);
}

/** 按流向补符号展示：入账 +，出账 −（金额本身存无符号十进制字符串） */
export function formatSignedMoney(
  amount: string,
  currency: string,
  direction: "in" | "out",
): string {
  return `${direction === "in" ? "+" : "−"}${formatMoney(amount, currency)}`;
}

/** ISO8601 → 短日期。固定 UTC，避免 SSR/客户端时区不一致导致 hydration 不匹配 */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
