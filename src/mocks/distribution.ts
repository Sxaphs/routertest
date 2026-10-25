/** 分销商后台（/distribution/*）全部 mock。TODO(backend): 接 OURBRAND 分销体系真实接口 */
import { hashStr } from "./hash";

/* ---------- 角色 ---------- */

export const ROLE_STORAGE = "ourbrand.role"; // "user" | "distributor" | "admin"
export type Role = "user" | "distributor" | "admin";

/* ---------- 概览仪表盘 ---------- */

export const OVERVIEW_STATS = [
  { label: "End users", value: "1,284", delta: "+62 this month" },
  { label: "Tokens this month", value: "8.42B", delta: "+18.3% MoM" },
  { label: "GMV this month", value: "$21,860", delta: "+15.9% MoM" },
  { label: "Est. gross margin", value: "$3,940", delta: "18.0% of GMV" },
  { label: "Commission", value: "$1,093", delta: "5.0% of GMV" },
];

/** 近 30 天调用量（B tokens，确定性 mock） */
export const DAILY_TOKENS_30D: number[] = Array.from({ length: 30 }, (_, i) => {
  const h = hashStr("daily" + i);
  return 0.15 + (i / 30) * 0.25 + (h % 30) / 100;
});

export interface TopUser {
  name: string;
  tokensB: string;
  spend: string;
}

export const TOP_USERS: TopUser[] = [
  { name: "acme-corp", tokensB: "1.82B", spend: "$4,210" },
  { name: "beta-labs", tokensB: "1.35B", spend: "$3,180" },
  { name: "gamma-app", tokensB: "0.94B", spend: "$2,305" },
  { name: "delta-ai", tokensB: "0.71B", spend: "$1,720" },
  { name: "epsilon-io", tokensB: "0.58B", spend: "$1,415" },
];

/* ---------- 终端用户管理 ---------- */

export interface SubAccount {
  id: string;
  name: string;
  keyCount: number;
  monthlySpend: string;
  balance: string;
  status: "active" | "disabled";
  /** 用户级限额与保险丝（双层：分销商总预算 + 每用户限额） */
  monthlyLimit: number | null;
  autoFuse: boolean;
}

export const MOCK_SUBACCOUNTS: SubAccount[] = [
  { id: "u-01", name: "acme-corp", keyCount: 4, monthlySpend: "$4,210", balance: "$1,820", status: "active", monthlyLimit: 5000, autoFuse: true },
  { id: "u-02", name: "beta-labs", keyCount: 2, monthlySpend: "$3,180", balance: "$540", status: "active", monthlyLimit: null, autoFuse: false },
  { id: "u-03", name: "gamma-app", keyCount: 3, monthlySpend: "$2,305", balance: "$0", status: "disabled", monthlyLimit: 2000, autoFuse: true },
  { id: "u-04", name: "delta-ai", keyCount: 1, monthlySpend: "$1,720", balance: "$310", status: "active", monthlyLimit: null, autoFuse: false },
  { id: "u-05", name: "epsilon-io", keyCount: 2, monthlySpend: "$1,415", balance: "$95", status: "active", monthlyLimit: 1000, autoFuse: true },
  { id: "u-06", name: "zeta-dev", keyCount: 1, monthlySpend: "$402", balance: "$1,200", status: "active", monthlyLimit: null, autoFuse: false },
];

/** 分销商层总预算（双层保险丝的上层） */
export const DISTRIBUTOR_BUDGET = { monthlyBudget: 25000, spent: 21860, autoFuse: true };

/* ---------- 定价管理 ---------- */

export interface PriceTier {
  name: string;
  commitment: string; // 承诺月消耗量
  discount: number; // 批发折扣（相对官方参考价）
}

export const PRICE_TIERS: PriceTier[] = [
  { name: "Starter", commitment: "$5k / month", discount: 0.1 },
  { name: "Growth", commitment: "$25k / month", discount: 0.18 },
  { name: "Scale", commitment: "$100k / month", discount: 0.28 },
];

export interface RepresentativeModel {
  id: string;
  officialInput: number; // 官方参考价 $/1M
  officialOutput: number;
}

/** 三个代表模型（价格取自公开目录真实数据） */
export const REPRESENTATIVE_MODELS: RepresentativeModel[] = [
  { id: "anthropic/claude-opus-5.5", officialInput: 4, officialOutput: 20 },
  { id: "google/gemini-4-argon", officialInput: 2, officialOutput: 10 },
  { id: "liquid/lfm-2.5-24b-a2b", officialInput: 0.1, officialOutput: 1 },
];

/* ---------- 分账与对账 ---------- */

export const SETTLEMENT = {
  period: "Oct 1 – Oct 31, 2026",
  withdrawable: "$2,847.20",
  currency: "USD",
};

export interface Withdrawal {
  id: string;
  date: string;
  amount: string;
  method: string;
  status: "Processing" | "Paid";
}

export const MOCK_WITHDRAWALS: Withdrawal[] = [
  { id: "wd-08", date: "Oct 10, 2026", amount: "$1,500.00", method: "Bank ****6789", status: "Paid" },
  { id: "wd-09", date: "Oct 13, 2026", amount: "$800.00", method: "USDC", status: "Processing" },
];

export interface Statement {
  id: string;
  month: string;
  gmv: string;
  commission: string;
  net: string;
}

export const MOCK_STATEMENTS: Statement[] = [
  { id: "st-08", month: "August 2026", gmv: "$14,220", commission: "$711", net: "$13,509" },
  { id: "st-09", month: "September 2026", gmv: "$18,860", commission: "$943", net: "$17,917" },
  { id: "st-10", month: "October 2026 (in progress)", gmv: "$21,860", commission: "$1,093", net: "$20,767" },
];
