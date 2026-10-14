/**
 * 公开模型目录的数据层。
 * 上游：GET https://openrouter.ai/api/v1/models（免鉴权公开端点，约定唯一允许的在线数据源）
 * TODO(backend): 上线前把上游换成 OURBRAND 自己的 /v1/models。
 */

export const MODELS_UPSTREAM = "https://openrouter.ai/api/v1/models";

/** 服务端目录拉取（缓存 1h，失败返回空表）。页面/路由共用，替代各自内联的 fetch。 */
export async function getCatalogServer(): Promise<CatalogModel[]> {
  try {
    const res = await fetch(MODELS_UPSTREAM, {
      next: { revalidate: 3600 },
      headers: { "User-Agent": "OURBRAND-dev/0.1" },
    });
    if (!res.ok) return [];
    const j = (await res.json()) as ModelsResponse;
    return j.data;
  } catch {
    return [];
  }
}

export interface ModelArchitecture {
  modality: string;
  input_modalities: string[];
  output_modalities: string[];
  tokenizer: string | null;
  instruct_type: string | null;
}

export interface ModelPricing {
  /** 美元 / token，字符串十进制 */
  prompt: string;
  completion: string;
  image?: string;
  audio?: string;
  input_audio_cache?: string;
  web_search?: string;
  internal_reasoning?: string;
  input_cache_read?: string;
  input_cache_write?: string;
}

export interface CatalogModel {
  id: string; // "{author}/{slug}"
  canonical_slug: string; // 带日期后缀，如 "anthropic/claude-opus-5.5-20260921"
  hugging_face_id: string | null;
  name: string; // "Anthropic: Claude Opus 5.5"
  created: number; // unix 秒
  description: string;
  context_length: number | null;
  architecture: ModelArchitecture;
  pricing: ModelPricing;
  top_provider: {
    context_length: number | null;
    max_completion_tokens: number | null;
    is_moderated: boolean;
  } | null;
  per_request_limits: unknown;
  supported_parameters: string[];
  default_parameters: Record<string, unknown> | null;
}

export interface ModelsResponse {
  data: CatalogModel[];
  total_count?: number;
}

/** 作者（author 段） */
export function authorOf(m: CatalogModel): string {
  return m.id.split("/")[0] ?? "";
}

/** slug 段 */
export function slugOf(m: CatalogModel): string {
  return m.id.split("/").slice(1).join("/");
}

/** 每百万 token 的美元价格；null 表示免费/未知 */
export function pricePerMillion(perToken: string | undefined): number | null {
  if (!perToken) return null;
  const n = Number(perToken);
  if (!Number.isFinite(n)) return null;
  return n * 1_000_000;
}

export function formatPricePerMillion(perToken: string | undefined): string {
  const n = pricePerMillion(perToken);
  if (n === null || n === 0) return "$0";
  if (n < 0.01) return "<$0.01";
  return `$${n < 10 ? n.toFixed(2) : Math.round(n)}`;
}

export function formatContext(n: number | null): string {
  if (!n) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 ? 2 : 0)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

export function formatDate(unixSec: number): string {
  // 固定 UTC，避免 SSR/客户端时区不一致导致 hydration 不匹配
  return new Date(unixSec * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** 客户端缓存 + 过滤 */
let cache: Promise<CatalogModel[]> | null = null;

export function fetchCatalog(): Promise<CatalogModel[]> {
  if (!cache) {
    cache = fetch("/api/models")
      .then((r) => {
        if (!r.ok) throw new Error(`models proxy ${r.status}`);
        return r.json() as Promise<ModelsResponse>;
      })
      .then((j) => j.data);
  }
  return cache;
}

export type SortOrder =
  | "newest"
  | "pricing-low-to-high"
  | "pricing-high-to-low"
  | "context-high-to-low";

export function filterAndSort(
  models: CatalogModel[],
  opts: {
    q?: string;
    inputModalities?: string[];
    outputModality?: string; // "text" | "image" | ...
    discountedOnly?: boolean;
    sort?: SortOrder;
  },
): CatalogModel[] {
  let out = models;
  const q = opts.q?.trim().toLowerCase();
  if (q) {
    out = out.filter(
      (m) =>
        m.id.toLowerCase().includes(q) ||
        m.name.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q),
    );
  }
  if (opts.inputModalities?.length) {
    const want = new Set(opts.inputModalities);
    out = out.filter((m) =>
      m.architecture.input_modalities.some((x) => want.has(x)),
    );
  }
  if (opts.outputModality && opts.outputModality !== "all") {
    out = out.filter((m) =>
      m.architecture.output_modalities.includes(opts.outputModality!),
    );
  }
  switch (opts.sort ?? "newest") {
    case "newest":
      out = [...out].sort((a, b) => b.created - a.created);
      break;
    case "pricing-low-to-high":
      out = [...out].sort(
        (a, b) => Number(a.pricing.prompt) - Number(b.pricing.prompt),
      );
      break;
    case "pricing-high-to-low":
      out = [...out].sort(
        (a, b) => Number(b.pricing.prompt) - Number(a.pricing.prompt),
      );
      break;
    case "context-high-to-low":
      out = [...out].sort(
        (a, b) => (b.context_length ?? 0) - (a.context_length ?? 0),
      );
      break;
  }
  return out;
}
