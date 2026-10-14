"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, Copy, Info, Pin, Search } from "lucide-react";
import {
  authorOf,
  fetchCatalog,
  filterAndSort,
  formatContext,
  formatDate,
  formatPricePerMillion,
  type CatalogModel,
  type SortOrder,
} from "@/lib/models";
import { ProviderIcon } from "@/components/provider-icon";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { mockDiscount, mockWeeklyTokens } from "@/mocks/catalog";

const INPUT_MODALITIES = ["text", "image", "file", "audio", "video"] as const;

/** 折叠分组标题（参照站左侧 18 个筛选组；首版完整实现 Input modalities，其余先占位） */
const PLACEHOLDER_GROUPS = [
  "Discounted",
  "Context length",
  "Prompt pricing",
  "Series",
  "Categories",
  "Supported parameters",
  "Distillable",
  "Zero data retention",
  "In-region routing",
  "Output pricing",
  "Model age",
  "Tool calling",
  "Inactive models",
  "Providers",
  "Model authors",
];


function FilterGroup({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b py-2 last:border-0">
      <button
        className="flex w-full items-center justify-between py-1 text-sm font-medium"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <span className="flex items-center gap-2">
          {/* 占位图标 */}
          <span className="size-4 rounded-sm border" aria-hidden />
          {title}
        </span>
        <ChevronDown
          className={cn("size-4 transition-transform", open && "rotate-180")}
        />
      </button>
      {open && children && <div className="space-y-2 pt-2">{children}</div>}
    </div>
  );
}

function ModelCard({ m }: { m: CatalogModel }) {
  const [copied, setCopied] = useState(false);
  const [pinned, setPinned] = useState(false);
  const discount = mockDiscount(m.id);
  const copy = async () => {
    await navigator.clipboard.writeText(m.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <li className="rounded-lg border bg-card p-4 transition-colors hover:border-primary/40">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2">
          <Link href={`/${authorOf(m)}`} aria-label={`Favicon for ${authorOf(m)}`}>
            <ProviderIcon name={authorOf(m)} />
          </Link>
          <Link
            href={`/${m.id}`}
            className="truncate text-lg font-semibold hover:underline"
          >
            {m.name}
          </Link>
          {discount && (
            <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              {discount}% off
            </Badge>
          )}
          <button
            aria-label="Copy to clipboard"
            onClick={copy}
            className="text-muted-foreground hover:text-foreground"
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          </button>
          <button
            aria-label="Pin model"
            onClick={() => setPinned(!pinned)}
            className={cn(
              "text-muted-foreground hover:text-foreground",
              pinned && "text-primary",
            )}
          >
            <Pin className="size-4" />
          </button>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex shrink-0 items-center gap-1 text-sm text-muted-foreground">
                {mockWeeklyTokens(m.id)} tokens
                <Info className="size-3.5" />
              </span>
            </TooltipTrigger>
            <TooltipContent>Tokens processed in the last 7 days</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Link href={`/${m.id}`}>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {m.description}
        </p>
      </Link>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
        <span>
          by{" "}
          <Link href={`/${authorOf(m)}`} className="underline underline-offset-2">
            {authorOf(m)}
          </Link>
        </span>
        <span>{formatDate(m.created)}</span>
        {m.context_length ? <span>{formatContext(m.context_length)} context</span> : null}
        <span>{formatPricePerMillion(m.pricing.prompt)}/M input tokens</span>
        <span>{formatPricePerMillion(m.pricing.completion)}/M output tokens</span>
      </div>
    </li>
  );
}

export function ModelsBrowser() {
  const [models, setModels] = useState<CatalogModel[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortOrder>("newest");
  const [inputMods, setInputMods] = useState<string[]>([]);
  const [tab, setTab] = useState("all");
  const [view, setView] = useState<"list" | "table">("list");

  useEffect(() => {
    fetchCatalog()
      .then(setModels)
      .catch((e) => setError(String(e)));
  }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const m of models ?? []) {
      for (const om of m.architecture.output_modalities) {
        c[om] = (c[om] ?? 0) + 1;
      }
    }
    return c;
  }, [models]);

  const filtered = useMemo(
    () =>
      filterAndSort(models ?? [], {
        q,
        inputModalities: inputMods,
        outputModality: tab,
        sort,
      }),
    [models, q, inputMods, tab, sort],
  );

  if (error)
    return <p className="p-8 text-destructive">模型目录加载失败：{error}</p>;

  return (
    <div className="mx-auto flex max-w-7xl gap-8 px-4 py-6 lg:px-6">
      {/* 筛选侧栏 */}
      <aside className="hidden w-56 shrink-0 lg:block">
        <FilterGroup title="Input modalities" defaultOpen>
          {INPUT_MODALITIES.map((mod) => (
            <label
              key={mod}
              className="flex cursor-pointer items-center gap-2 text-sm capitalize"
            >
              <Checkbox
                checked={inputMods.includes(mod)}
                onCheckedChange={(on) =>
                  setInputMods((prev) =>
                    on ? [...prev, mod] : prev.filter((x) => x !== mod),
                  )
                }
              />
              {mod}
            </label>
          ))}
        </FilterGroup>
        {PLACEHOLDER_GROUPS.map((g) => (
          <FilterGroup key={g} title={g} />
        ))}
      </aside>

      <div className="min-w-0 flex-1">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Models</h1>
          {/* TODO(backend): Compare/Discover 为阶段外功能，先隐藏 */}
        </div>

        {/* 工具行 */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative min-w-48 flex-1">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search models..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-8"
              aria-label="Search models..."
            />
          </div>
          <Select value={sort} onValueChange={(v) => setSort(v as SortOrder)}>
            <SelectTrigger className="w-44" aria-label="Sort order">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="pricing-low-to-high">
                Pricing: low to high
              </SelectItem>
              <SelectItem value="pricing-high-to-low">
                Pricing: high to low
              </SelectItem>
              <SelectItem value="context-high-to-low">
                Context: high to low
              </SelectItem>
            </SelectContent>
          </Select>
          <Tabs value={view} onValueChange={(v) => setView(v as "list" | "table")}>
            <TabsList aria-label="Models display format">
              <TabsTrigger value="list">List</TabsTrigger>
              <TabsTrigger value="table">Table</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* 模态 tabs */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList
            aria-label="Filter models by output modality"
            className="mb-4 flex-wrap"
          >
            <TabsTrigger value="all">All</TabsTrigger>
            {["text", "image", "video", "audio", "embeddings"].map((t) => (
              <TabsTrigger key={t} value={t} className="capitalize">
                {t === "audio" ? "Speech" : t} {counts[t] ?? 0}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* 列表 */}
        {!models ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : view === "list" ? (
          <ul className="space-y-3">
            {filtered.slice(0, 50).map((m) => (
              <ModelCard key={m.id} m={m} />
            ))}
          </ul>
        ) : (
          <div className="rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="p-3 font-medium">Model</th>
                  <th className="p-3 font-medium">Context</th>
                  <th className="p-3 font-medium">Input /M</th>
                  <th className="p-3 font-medium">Output /M</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 50).map((m) => (
                  <tr key={m.id} className="border-b last:border-0">
                    <td className="p-3">
                      <Link
                        href={`/${m.id}`}
                        className="flex items-center gap-2 font-medium hover:underline"
                      >
                        <ProviderIcon name={authorOf(m)} className="size-5" />
                        {m.name}
                      </Link>
                    </td>
                    <td className="p-3">{formatContext(m.context_length)}</td>
                    <td className="p-3">{formatPricePerMillion(m.pricing.prompt)}</td>
                    <td className="p-3">
                      {formatPricePerMillion(m.pricing.completion)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {models && (
          <p className="mt-4 text-sm text-muted-foreground">
            共 {filtered.length} 个模型（首屏渲染前 50 个）
          </p>
        )}
      </div>
    </div>
  );
}
