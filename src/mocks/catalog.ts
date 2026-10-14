/**
 * 由公开模型目录派生的 mock 数据（用量、provider 行、折扣、排行）。
 * TODO(backend): 全部替换为 OURBRAND 真实统计接口。
 */
import type { CatalogModel } from "@/lib/models";
import { pricePerMillion } from "@/lib/models";
import { hashStr } from "./hash";

/* ---------- 列表页卡片 ---------- */

/** 稳定的伪随机周用量（mock）。TODO(backend) */
export function mockWeeklyTokens(id: string): string {
  const h = hashStr(id);
  const v = (h % 9000) / 10 + 0.1;
  return v >= 1000 ? `${(v / 1000).toFixed(2)}T` : `${v.toFixed(1)}B`;
}

/** 稳定的伪随机折扣（mock）。TODO(backend) */
export function mockDiscount(id: string): number | null {
  let h = 7; // 与迁移前实现一致的 seed
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h % 11 === 0 ? 20 : h % 17 === 0 ? 50 : null;
}

/* ---------- 详情页 provider 表（mock，TODO(backend)） ---------- */

const PROVIDER_POOL = [
  "Amazon Bedrock",
  "Azure",
  "Google Vertex",
  "CloudRun",
  "CoreWeave",
  "Together",
];

export interface ProviderRow {
  name: string;
  privacy: "Private" | "Logs";
  input: string;
  output: string;
  cacheRead: string;
  latency: string;
  throughput: string;
  uptime: string;
}

export function mockProviders(m: CatalogModel): ProviderRow[] {
  const base = hashStr(m.id);
  const inM = pricePerMillion(m.pricing.prompt) ?? 0;
  const outM = pricePerMillion(m.pricing.completion) ?? 0;
  return PROVIDER_POOL.map((name, i): ProviderRow => {
    const h = hashStr(m.id + name);
    const jitter = 1 + ((h % 10) - 5) / 100;
    return {
      name,
      privacy: h % 3 === 0 ? "Private" : "Logs",
      input: `$${(inM * jitter).toFixed(2)}`,
      output: `$${(outM * jitter).toFixed(2)}`,
      cacheRead: `$${(inM * 0.05 * jitter).toFixed(2)}`,
      latency: `${(2 + (h % 40) / 10).toFixed(2)}s`,
      throughput: `${40 + (h % 60)} tps`,
      uptime: `${(96 + (h % 399) / 100).toFixed(2)}%`,
    };
  }).filter((_, i) => (base + i) % 5 !== 0 || i < 3);
}

/* ---------- 排行榜（mock，TODO(backend)） ---------- */

export interface RankRow {
  model: CatalogModel;
  tokensT: number;
  change: string;
}

export function mockRankings(models: CatalogModel[]): RankRow[] {
  return models
    .map((m) => {
      const h = hashStr(m.id);
      return {
        model: m,
        tokensT: (h % 4000) / 100 + 0.5,
        change: h % 9 === 0 ? "new" : `${h % 2 ? "+" : "-"}${(h % 60) + 1}%`,
      };
    })
    .sort((a, b) => b.tokensT - a.tokensT)
    .slice(0, 20);
}
