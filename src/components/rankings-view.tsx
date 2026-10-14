"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { authorOf, type CatalogModel } from "@/lib/models";
import { brand } from "@/config/brand";
import { ProviderIcon } from "@/components/provider-icon";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { hashStr } from "@/mocks/hash";
import { mockRankings, type RankRow } from "@/mocks/catalog";


const SECTIONS = [
  ["Top Models", "top-models"],
  ["Leaderboard", "leaderboard-table"],
  ["Market Share", "market-share"],
] as const;

const CHART_COLORS = [
  "#0088fe", "#00c49f", "#ffbb28", "#ff8042", "#4682b4",
  "#9acd32", "#40e0d0", "#ff69b4", "#daa520", "#7b68ee",
];

/** 堆叠柱状图（纯 SVG mock，TODO(backend): 换真实周用量序列） */
function TopModelsChart({ rows }: { rows: RankRow[] }) {
  const [scale, setScale] = useState<"linear" | "log">("linear");
  const weeks = 24;
  const series = useMemo(
    () =>
      rows.slice(0, 10).map((r, i) => ({
        name: r.model.name,
        color: CHART_COLORS[i % CHART_COLORS.length],
        // 确定性增长曲线
        values: Array.from({ length: weeks }, (_, w) => {
          const h = hashStr(r.model.id + w);
          return r.tokensT * (0.15 + (w / weeks) * 0.85) * (0.8 + (h % 40) / 100);
        }),
      })),
    [rows],
  );
  const totals = Array.from({ length: weeks }, (_, w) =>
    series.reduce((s, sr) => s + sr.values[w], 0),
  );
  const maxRaw = Math.max(...totals);
  const tx = (v: number) =>
    scale === "log" ? Math.log10(v + 1) / Math.log10(maxRaw + 1) : v / maxRaw;
  const W = 720;
  const H = 260;
  const bw = W / weeks;

  return (
    <div>
      <div className="mb-2 flex justify-end">
        <div
          role="radiogroup"
          aria-label="Y-axis scale"
          className="flex rounded-md border text-sm"
        >
          {(["linear", "log"] as const).map((s) => (
            <button
              key={s}
              role="radio"
              aria-checked={scale === s}
              onClick={() => setScale(s)}
              className={cn(
                "px-3 py-1 capitalize",
                scale === s && "bg-accent text-accent-foreground",
              )}
            >
              {s === "linear" ? "Linear" : "Log"}
            </button>
          ))}
        </div>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label="Weekly token usage stacked bars"
      >
        {Array.from({ length: weeks }, (_, w) => {
          let y = H;
          return (
            <g key={w}>
              {series.map((sr) => {
                const h = tx(totals[w]) === 0 ? 0 : (sr.values[w] / totals[w]) * tx(totals[w]) * H;
                y -= h;
                return (
                  <rect
                    key={sr.name}
                    x={w * bw + 1}
                    y={y}
                    width={bw - 2}
                    height={Math.max(h, 0)}
                    fill={sr.color}
                  />
                );
              })}
            </g>
          );
        })}
      </svg>
      <p className="mt-1 text-right text-xs text-muted-foreground">
        Y 轴峰值 {maxRaw.toFixed(0)}T tokens（mock）
      </p>
    </div>
  );
}

export function RankingsView({
  models,
  dataThrough,
}: {
  models: CatalogModel[];
  dataThrough: string;
}) {
  const [tab, setTab] = useState("text");
  const [window_, setWindow] = useState("week");
  const [openness, setOpenness] = useState("all");
  const rows = useMemo(() => mockRankings(models), [models]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
      {/* 模态 tabs：首版仅 Text 有内容（已确认的裁剪范围） */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList aria-label="Rankings sections" className="mb-6 flex-wrap">
          {["Text", "Image", "Video", "Speech", "Decisions", "Embeddings", "Rerank", "Transcription", "Batch"].map(
            (t) => (
              <TabsTrigger key={t} value={t.toLowerCase()}>
                {t}
              </TabsTrigger>
            ),
          )}
        </TabsList>
      </Tabs>

      {tab !== "text" ? (
        <div className="flex h-48 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
          {tab} 排行待接入（TODO(backend)）
        </div>
      ) : (
        <div className="flex gap-10">
          <nav
            aria-label="Rankings page sections"
            className="hidden w-48 shrink-0 lg:block"
          >
            <ul className="sticky top-24 space-y-1">
              {SECTIONS.map(([label, anchor], i) => (
                <li key={anchor}>
                  <a
                    href={`#${anchor}`}
                    className={cn(
                      "block rounded-md px-3 py-1.5 text-sm",
                      i === 0
                        ? "bg-accent font-medium text-accent-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="min-w-0 flex-1 space-y-12">
            <div>
              <h1 className="text-2xl font-bold">AI Model Rankings</h1>
              <p className="mt-2 text-muted-foreground">
                Live LLM rankings by real-world usage. Models are ranked by
                tokens processed through the {brand.name} API.{" "}
                <Link href="/models" className="underline underline-offset-4">
                  View all text models
                </Link>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Usage data through <time>{dataThrough}</time>
              </p>
            </div>

            <section id="top-models">
              <h2 className="mb-1 text-xl font-bold">Top Models</h2>
              <p className="mb-4 text-sm text-muted-foreground">
                Weekly usage of models across the platform
              </p>
              <TopModelsChart rows={rows} />
            </section>

            <section id="leaderboard-table">
              <h2 className="mb-1 text-xl font-bold">LLM Leaderboard</h2>
              <p className="mb-4 text-sm text-muted-foreground">
                Compare the most popular models
              </p>
              <div className="mb-3 flex gap-2">
                <Select value={openness} onValueChange={setOpenness}>
                  <SelectTrigger className="w-40" aria-label="Filter models by openness">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All models</SelectItem>
                    <SelectItem value="open">Open weights</SelectItem>
                    <SelectItem value="proprietary">Proprietary</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={window_} onValueChange={setWindow}>
                  <SelectTrigger className="w-36" aria-label="Filter by time window">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="overflow-x-auto rounded-lg border">
                <table
                  className="w-full text-sm"
                  aria-label="Model rankings by tokens processed"
                >
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      {["Rank", "Model", "Author", "Tokens processed", "Change"].map(
                        (h) => (
                          <th key={h} className="p-3 font-medium">
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={r.model.id} className="border-b last:border-0">
                        <td className="p-3">{i + 1}</td>
                        <td className="p-3">
                          <Link
                            href={`/${r.model.id}`}
                            className="flex items-center gap-2 font-medium hover:underline"
                          >
                            <ProviderIcon
                              name={authorOf(r.model)}
                              className="size-5"
                            />
                            {r.model.name.split(": ").slice(1).join(": ") ||
                              r.model.name}
                          </Link>
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {authorOf(r.model)}
                        </td>
                        <td className="p-3">{r.tokensT.toFixed(1)}T tokens</td>
                        <td
                          className={cn(
                            "p-3",
                            r.change === "new"
                              ? "text-primary"
                              : r.change.startsWith("+")
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-muted-foreground",
                          )}
                        >
                          {r.change}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section id="market-share">
              <h2 className="mb-1 text-xl font-bold">Market Share</h2>
              <div className="flex h-40 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                Market share 图表待接入（TODO(backend)）
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}

