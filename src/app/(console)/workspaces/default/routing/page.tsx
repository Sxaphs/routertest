"use client";

import { useState } from "react";
import { Info, Route } from "lucide-react";
import { brand } from "@/config/brand";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * 工作区 Routing 设置（全部内存 mock，TODO(backend): 接 OURBRAND 路由设置）。
 * 结构对齐参照站 /workspaces/default/routing。
 */

const autoSlug = brand.name.toLowerCase();

function Section({
  title,
  desc,
  children,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-4 border-b py-8 last:border-0 md:grid-cols-[240px_1fr]">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          {title === "Auto Router" && <Route className="size-4" />}
          {title}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      </div>
      <div className="min-w-0 space-y-4">{children}</div>
    </section>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-medium">{children}</p>;
}

const textareaClass =
  "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50";

export default function RoutingPage() {
  // TODO(backend): 初始值与保存都接真实路由设置接口
  const [costTier, setCostTier] = useState("low");
  const [allowed, setAllowed] = useState("");
  const [excluded, setExcluded] = useState("");
  const [preventOverrides, setPreventOverrides] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [providerSort, setProviderSort] = useState("default");
  const [defaultModel, setDefaultModel] = useState("none");

  const touch = () => setDirty(true);

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold">Routing</h1>

      <Section
        title="Auto Router"
        desc="Configure which models the Auto Router can route to."
      >
        <p className="text-sm">
          Route to the best model for each request using{" "}
          <a href="#" className="font-mono underline underline-offset-4">
            {autoSlug}/auto
          </a>{" "}
          and{" "}
          <a href="#" className="font-mono underline underline-offset-4">
            {autoSlug}/auto-beta
          </a>
          .{" "}
          <a href="#" className="underline underline-offset-4">
            Learn more
          </a>
        </p>

        <FieldLabel>Cost Tier</FieldLabel>
        <Select
          value={costTier}
          onValueChange={(v) => {
            setCostTier(v);
            touch();
          }}
        >
          <SelectTrigger className="w-64" aria-label="Cost Tier">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low (Default)</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          Only models within the selected cost band are used for routing.
          Lower tiers favor cheaper models, while higher tiers favor more
          capable, expensive ones.
        </p>

        <FieldLabel>Restrict to Allowed Model List</FieldLabel>
        <textarea
          aria-label="Restrict to Allowed Model List"
          className={textareaClass}
          rows={4}
          placeholder="anthropic/*, openai/gpt-4o, google/*"
          value={allowed}
          onChange={(e) => {
            setAllowed(e.target.value);
            touch();
          }}
        />
        <p className="text-sm text-muted-foreground">
          Use model patterns to control which models the auto-router can route
          between. Separate patterns with commas or newlines, and use wildcards
          such as &quot;anthropic/*&quot; to match a model family. Leave empty
          to let the auto-router choose from every model it ranks for your
          request.
        </p>

        <FieldLabel>Excluded Model List</FieldLabel>
        <textarea
          aria-label="Excluded Model List"
          className={textareaClass}
          rows={4}
          placeholder="openai/gpt-4o, meta-llama/*"
          value={excluded}
          onChange={(e) => {
            setExcluded(e.target.value);
            touch();
          }}
        />
        <p className="text-sm text-muted-foreground">
          Use model patterns to exclude models from auto-router selection. Same
          syntax as the allow list: separate patterns with commas or newlines,
          and wildcards such as &quot;openai/*&quot; match a model family.
          Exclusions apply after the allow list, so an excluded model is never
          routed to even when it matches an allowed pattern. Leave empty to
          exclude nothing.
        </p>

        <div className="flex items-center justify-between gap-4">
          <FieldLabel>
            <span className="inline-flex items-center gap-1">
              Prevent overrides
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button aria-label="Information">
                      <Info className="size-3.5 text-muted-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Prevent individual requests from overriding these routing
                    settings.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </span>
          </FieldLabel>
          <Switch
            aria-label="Prevent overrides"
            checked={preventOverrides}
            onCheckedChange={(v) => {
              setPreventOverrides(v);
              touch();
            }}
          />
        </div>

        <div>
          <Button
            disabled={!dirty}
            onClick={() => {
              // TODO(backend): 保存路由设置
              setDirty(false);
            }}
          >
            Save
          </Button>
        </div>
      </Section>

      <Section
        title="Default Provider Sort"
        desc="Choose how providers should be sorted for your requests."
      >
        <p className="text-sm text-muted-foreground">
          Choose how providers should be sorted. Individual requests can
          override this setting. By default, {brand.name} balances low prices
          with high uptime.{" "}
          <a href="#" className="underline underline-offset-4">
            Learn more
          </a>
          .
        </p>
        <Select value={providerSort} onValueChange={setProviderSort}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default (balanced)</SelectItem>
            <SelectItem value="price">Price</SelectItem>
            <SelectItem value="throughput">Throughput</SelectItem>
            <SelectItem value="latency">Latency</SelectItem>
          </SelectContent>
        </Select>
      </Section>

      <Section
        title="Default Model"
        desc="Set the default model for apps and fallback routing."
      >
        <p className="text-sm text-muted-foreground">
          Apps will use this model by default, but they may override it if they
          choose to do so. This model will also be used as your default{" "}
          <a href="#" className="underline underline-offset-4">
            fallback model
          </a>
          .
        </p>
        {/* TODO(backend): 模型选择器接 /api/v1/models */}
        <Select value={defaultModel} onValueChange={setDefaultModel}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No default</SelectItem>
            <SelectItem value="auto">{autoSlug}/auto</SelectItem>
          </SelectContent>
        </Select>
      </Section>
    </div>
  );
}
