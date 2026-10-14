"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  Copy,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Pin,
  Type,
} from "lucide-react";
import {
  authorOf,
  formatContext,
  formatDate,
  formatPricePerMillion,
  pricePerMillion,
  type CatalogModel,
} from "@/lib/models";
import { brand } from "@/config/brand";
import { ProviderIcon } from "@/components/provider-icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { mockProviders, type ProviderRow } from "@/mocks/catalog";

/* ---------- 小组件 ---------- */

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      {label ? <span className="ml-1">{copied ? "Copied" : label}</span> : null}
    </Button>
  );
}

const SECTIONS = [
  "Providers",
  "Pricing",
  "Performance",
  "Uptime",
  "Benchmarks",
  "Apps",
  "Activity",
] as const;

/* ---------- API 面板 ---------- */

function codeSamples(m: CatalogModel): Record<string, string> {
  return {
    "TypeScript (fetch)": `const response = await fetch("https://api.ourbrand.example/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer ${"OURBRAND_API_KEY"}",
  },
  body: JSON.stringify({
    model: "${m.id}",
    messages: [{ role: "user", content: "Hello" }],
  }),
});
const data = await response.json();`,
    cURL: `curl https://api.ourbrand.example/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $OURBRAND_API_KEY" \\
  -d '{
    "model": "${m.id}",
    "messages": [{ "role": "user", "content": "Hello" }]
  }'`,
    Python: `import requests

response = requests.post(
    "https://api.ourbrand.example/v1/chat/completions",
    headers={"Authorization": f"Bearer {OURBRAND_API_KEY}"},
    json={
        "model": "${m.id}",
        "messages": [{"role": "user", "content": "Hello"}],
    },
)
print(response.json())`,
  };
}

function ApiDialog({ model }: { model: CatalogModel }) {
  const samples = codeSamples(model);
  return (
    <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>API</DialogTitle>
        <DialogDescription>
          Your key, drop-in code and the LLMs.txt for {model.id}.
        </DialogDescription>
      </DialogHeader>

      <h3 className="mt-2 font-semibold">1&nbsp;&nbsp;Get your API key</h3>
      <p className="text-sm text-muted-foreground">
        Create an API key from your {brand.name} dashboard and set it as an
        environment variable:
      </p>
      <div className="flex items-center gap-2">
        <Button asChild>
          <Link href="/sign-in?redirect_url=%2Fsettings%2Fkeys">Get API Key</Link>
        </Button>
      </div>
      <div className="flex items-center justify-between rounded-md border bg-muted px-3 py-2 font-mono text-sm">
        <code>export OURBRAND_API_KEY=ob-v1-...</code>
        <CopyButton text="export OURBRAND_API_KEY=ob-v1-..." label="Copy" />
      </div>

      <h3 className="mt-4 font-semibold">2&nbsp;&nbsp;Make your first request</h3>
      <p className="text-sm text-muted-foreground">
        Use <code className="rounded bg-muted px-1">{model.id}</code> with the{" "}
        {brand.name} API:
      </p>
      <Tabs defaultValue={Object.keys(samples)[0]}>
        <TabsList className="flex-wrap">
          {Object.keys(samples).map((k) => (
            <TabsTrigger key={k} value={k}>
              {k}
            </TabsTrigger>
          ))}
        </TabsList>
        {Object.entries(samples).map(([k, code]) => (
          <TabsContent key={k} value={k}>
            <div className="relative rounded-md border bg-muted p-3">
              <pre className="overflow-x-auto font-mono text-xs whitespace-pre">
                {code}
              </pre>
              <div className="absolute right-2 top-2">
                <CopyButton text={code} label="Copy" />
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
      {/* TODO(backend): 端点与鉴权头以 OURBRAND 真实 API 文档为准 */}
      <p className="mt-2 text-xs text-muted-foreground">
        Endpoint:{" "}
        <code className="rounded bg-muted px-1">
          https://api.ourbrand.example/v1/chat/completions
        </code>{" "}
        · Auth:{" "}
        <code className="rounded bg-muted px-1">
          Bearer $OURBRAND_API_KEY
        </code>
      </p>
    </DialogContent>
  );
}

/* ---------- 主组件 ---------- */

export function ModelDetail({ model: m }: { model: CatalogModel }) {
  const [showMore, setShowMore] = useState(false);
  const providers = mockProviders(m);
  const inputMods = m.architecture.input_modalities;
  const outputMods = m.architecture.output_modalities;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      {/* 头部 */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <ProviderIcon name={authorOf(m)} className="size-8 text-base" />
            <h1 className="text-2xl font-bold md:text-3xl">{m.name}</h1>
          </div>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <Link href={`/${authorOf(m)}`} className="hover:underline">
              {authorOf(m)}
            </Link>
            <span>/{m.id.split("/").slice(1).join("/")}</span>
            <CopyButton text={m.id} />
            <button
              aria-label="Pin model"
              className="text-muted-foreground hover:text-foreground"
            >
              <Pin className="size-4" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/models">Compare</Link>
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <ExternalLink className="mr-1 size-4" />
                API
              </Button>
            </DialogTrigger>
            <ApiDialog model={m} />
          </Dialog>
          <Button asChild>
            <Link href={`/chat?model=${encodeURIComponent(m.id)}`}>
              Try this model
            </Link>
          </Button>
        </div>
      </div>

      {/* 描述 */}
      <p
        className={cn(
          "mt-4 max-w-4xl text-muted-foreground",
          !showMore && "line-clamp-2",
        )}
      >
        {m.description}
      </p>
      <button
        className="mt-1 text-sm text-muted-foreground hover:text-foreground"
        onClick={() => setShowMore(!showMore)}
      >
        Show {showMore ? "less" : "more"}
      </button>

      {/* 统计卡 */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Modalities
            </p>
            <p className="mt-2 flex items-center gap-1.5">
              {inputMods.includes("text") && <Type className="size-4" />}
              {inputMods.includes("image") && <ImageIcon className="size-4" />}
              {inputMods.includes("file") && <FileText className="size-4" />}
              <span className="mx-1">→</span>
              {outputMods.includes("text") && <Type className="size-4" />}
              {outputMods.includes("image") && <ImageIcon className="size-4" />}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              In / Out Price
            </p>
            <p className="mt-2 text-lg font-semibold">
              {formatPricePerMillion(m.pricing.prompt)} /{" "}
              {formatPricePerMillion(m.pricing.completion)}
              <span className="ml-1 text-xs font-normal text-muted-foreground">
                per 1M
              </span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Context
            </p>
            <p className="mt-2 text-lg font-semibold">
              {formatContext(m.context_length)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Released
            </p>
            <p className="mt-2 text-lg font-semibold">{formatDate(m.created)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-10 flex gap-10">
        {/* 锚点导航 */}
        <nav
          aria-label="Model page sections"
          className="hidden w-40 shrink-0 lg:block"
        >
          <ul className="sticky top-24 space-y-1">
            {SECTIONS.map((s, i) => (
              <li key={s}>
                <a
                  href={`#${s.toLowerCase()}`}
                  className={cn(
                    "block rounded-md px-3 py-1.5 text-sm",
                    i === 0
                      ? "bg-accent font-medium text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {s}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0 flex-1 space-y-12">
          {/* Providers */}
          <section id="providers">
            <h2 className="text-xl font-bold">Providers</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Different companies host the same model. {brand.name} routes your
              request to one of them based on the routing mode you pick —
              Balanced (price + speed), Nitro (fastest), or Floor (cheapest).
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Select defaultValue="standard">
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="nitro">Nitro</SelectItem>
                  <SelectItem value="floor">Floor</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-36" aria-label="Reasoning effort">
                  <SelectValue placeholder="Reasoning effort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All effort</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="p50">
                <SelectTrigger className="w-28" aria-label="Latency / throughput percentile">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="p50">P50</SelectItem>
                  <SelectItem value="p90">P90</SelectItem>
                  <SelectItem value="p99">P99</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* TODO(backend): provider 行数据全部 mock */}
            <div className="mt-4 overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    {[
                      "Provider",
                      "Input /M",
                      "Output /M",
                      "Cache read /M",
                      "Latency",
                      "Throughput",
                      "Uptime",
                    ].map((h) => (
                      <th key={h} className="p-3 font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {providers.map((p) => (
                    <tr key={p.name} className="border-b last:border-0">
                      <td className="p-3">
                        <span className="flex items-center gap-2 font-medium">
                          <ProviderIcon name={p.name} className="size-5" />
                          {p.name}
                          <Badge variant="outline" className="text-xs">
                            {p.privacy}
                          </Badge>
                        </span>
                      </td>
                      <td className="p-3">{p.input}</td>
                      <td className="p-3">{p.output}</td>
                      <td className="p-3">{p.cacheRead}</td>
                      <td className="p-3">{p.latency}</td>
                      <td className="p-3">{p.throughput}</td>
                      <td className="p-3">{p.uptime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Pricing（真实目录数据） */}
          <section id="pricing">
            <h2 className="text-xl font-bold">Pricing</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ["Input", m.pricing.prompt],
                ["Output", m.pricing.completion],
                ["Cache read", m.pricing.input_cache_read],
                ["Cache write", m.pricing.input_cache_write],
                ["Image", m.pricing.image],
                ["Audio", m.pricing.audio],
              ]
                .filter(([, v]) => v !== undefined)
                .map(([label, v]) => (
                  <Card key={label as string}>
                    <CardContent className="pt-4">
                      <p className="text-xs uppercase text-muted-foreground">
                        {label}
                      </p>
                      <p className="mt-1 font-semibold">
                        {formatPricePerMillion(v as string)} /M tokens
                      </p>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </section>

          {/* 其余 section：占位，TODO(backend) */}
          {["Performance", "Uptime", "Benchmarks", "Apps", "Activity"].map(
            (s) => (
              <section key={s} id={s.toLowerCase()}>
                <h2 className="text-xl font-bold">{s}</h2>
                <div className="mt-4 flex h-32 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                  {s} 数据待接入（TODO(backend)）
                </div>
              </section>
            ),
          )}
        </div>
      </div>
    </div>
  );
}

