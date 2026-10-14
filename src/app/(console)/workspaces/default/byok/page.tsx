"use client";

import { useState } from "react";
import { ChevronRight, Info, Search } from "lucide-react";
import { brand } from "@/config/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * BYOK（Bring Your Own Keys，全部内存 mock，TODO(backend): 接 OURBRAND BYOK 配置）。
 * 结构对齐参照站 /workspaces/default/byok。
 */

interface ProviderEntry {
  id: string;
  name: string;
  status: string;
}

const PROVIDERS: ProviderEntry[] = [
  { id: "aionlabs", name: "AionLabs", status: "Not configured" },
  { id: "akashml", name: "AkashML", status: "Not configured" },
  { id: "alibaba", name: "Alibaba Cloud Int.", status: "Not configured" },
  { id: "bedrock", name: "Amazon Bedrock", status: "Not configured" },
  { id: "anthropic", name: "Anthropic", status: "Not configured" },
  { id: "arcee", name: "Arcee AI", status: "Not configured" },
  { id: "assemblyai", name: "AssemblyAI", status: "Not configured" },
  { id: "atlascloud", name: "AtlasCloud", status: "Not configured" },
  { id: "azure", name: "Azure", status: "Not configured" },
  { id: "baidu", name: "Baidu Qianfan", status: "Not configured" },
];
const HIDDEN_PROVIDER_COUNT = 64; // TODO(backend): 完整 provider 列表

const WEB_SEARCH_PROVIDERS: ProviderEntry[] = [
  { id: "exa", name: "Exa", status: "Not configured" },
  { id: "tavily", name: "Tavily", status: "Not configured" },
];

/** 第三方品牌 logo 用文字首字母占位（lucide 无品牌图标）。 */
function ProviderRow({ p }: { p: ProviderEntry }) {
  return (
    <button
      className="flex w-full items-center justify-between border-b px-4 py-3 text-left last:border-0 hover:bg-muted/50"
      onClick={() => alert(`配置 ${p.name} 尚未接入（TODO(backend)）`)}
    >
      <span className="flex items-center gap-3">
        <span
          aria-hidden
          className="flex size-8 items-center justify-center rounded-md bg-muted text-sm font-semibold"
        >
          {p.name.charAt(0)}
        </span>
        <span className="font-medium">{p.name}</span>
      </span>
      <span className="flex items-center gap-1 text-sm text-muted-foreground">
        {p.status}
        <ChevronRight className="size-4" />
      </span>
    </button>
  );
}

function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative w-full max-w-xs">
      <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-8"
        aria-label={placeholder}
      />
    </div>
  );
}

export default function ByokPage() {
  const [search, setSearch] = useState("");
  const [webSearch, setWebSearch] = useState("");
  const [expanded, setExpanded] = useState(false);

  const filtered = PROVIDERS.filter(
    (p) => !search || p.name.toLowerCase().includes(search.toLowerCase()),
  );
  const filteredWeb = WEB_SEARCH_PROVIDERS.filter(
    (p) => !webSearch || p.name.toLowerCase().includes(webSearch.toLowerCase()),
  );

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold">BYOK</h1>

      <Tabs defaultValue="providers" className="mt-4">
        <TabsList variant="line" className="w-full justify-start border-b">
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="web-search">Web search</TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="mt-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="flex items-center gap-1 text-lg font-semibold">
              Use your own provider API keys on {brand.name}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button aria-label="Information">
                      <Info className="size-4 text-muted-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Requests to these providers will use your own keys instead
                    of shared credits.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </h2>
            <SearchBox
              value={search}
              onChange={setSearch}
              placeholder="Search providers..."
            />
          </div>

          <h3 className="mt-6 font-semibold">Available</h3>
          <div className="mt-2 rounded-lg border">
            {filtered.map((p) => (
              <ProviderRow key={p.id} p={p} />
            ))}
          </div>
          {!expanded && !search && (
            <Button
              variant="ghost"
              className="mt-2"
              onClick={() => setExpanded(true)}
            >
              Show {HIDDEN_PROVIDER_COUNT} more
            </Button>
          )}
          {expanded && !search && (
            <p className="mt-2 text-sm text-muted-foreground">
              完整 provider 列表待接入（TODO(backend)）。
            </p>
          )}

          <h3 className="mt-8 font-semibold">Key Priority and Fallback</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {brand.name} always prioritizes using your provider keys when
            available. By default, if your key encounters a rate limit or
            failure, {brand.name} will fall back to using shared {brand.name}{" "}
            endpoints. You can configure individual keys with &quot;Always use
            this key&quot; to prevent any fallback to {brand.name} endpoints.
            When this option is enabled, {brand.name} will only use your key
            for requests to that provider. This may result in rate limit errors
            if your key is exhausted, but ensures all requests go through your
            account. If you wish to never use shared {brand.name} endpoints
            for a model, you must both specify &quot;Always use this key&quot;
            and pin the provider by specifying it as{" "}
            <a href="#" className="underline underline-offset-4">
              your only provider
            </a>{" "}
            when making the request.
          </p>
        </TabsContent>

        <TabsContent value="web-search" className="mt-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold">
              Use your own web search API keys
            </h2>
            <SearchBox
              value={webSearch}
              onChange={setWebSearch}
              placeholder="Search providers..."
            />
          </div>
          {/* TODO(backend): web search provider 列表与证据不全，按 Providers 模式 mock */}
          <h3 className="mt-6 font-semibold">Available</h3>
          <div className="mt-2 rounded-lg border">
            {filteredWeb.map((p) => (
              <ProviderRow key={p.id} p={p} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
