"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, Info, Layers, Plus } from "lucide-react";
import { brand } from "@/config/brand";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * 账户隐私设置（全部内存 mock，TODO(backend): 接 OURBRAND 数据策略/路由限制）。
 * 结构对齐参照站 /settings/privacy。
 */

// TODO(backend): ZDR 提供商列表与图标
const ZDR_PROVIDERS = [
  {
    id: "others",
    mark: null as string | null,
    name: "All other models",
    desc: "All other model requests will require ZDR endpoints.",
  },
  {
    id: "anthropic",
    mark: "A",
    name: "Anthropic",
    desc: "First-party Anthropic endpoints will be disabled. Bedrock and Vertex will still be enabled.",
  },
  {
    id: "openai",
    mark: "O",
    name: "OpenAI",
    desc: "First-party OpenAI endpoints will be disabled. Azure will still be enabled.",
  },
  {
    id: "google",
    mark: "G",
    name: "Google",
    desc: "Vertex endpoints require Safety Retention. AI Studio endpoints will be disabled.",
  },
  {
    id: "x-ai",
    mark: "X",
    name: "SpaceXAI",
    desc: "SpaceXAI endpoints that retain data will be disabled.",
  },
];

// TODO(backend): 资格预览模型列表与可用性统计
const PREVIEW_MODELS = [
  { mark: "P", name: "Pareto 26.9" },
  { mark: "H", name: "HeyGen Voice" },
  { mark: "H", name: "HeyGen Voice Turbo" },
  { mark: "L", name: "LFM2.5-24B-A2B" },
  { mark: "D", name: "Drama 3" },
  { mark: "G", name: "Gemini 4 Argon" },
  { mark: "G", name: "Gemini 4 Argon (batch)" },
  { mark: "S", name: "Summarize" },
  { mark: "S", name: "Extract" },
  { mark: "S", name: "Classify-1" },
  { mark: "D", name: "Drex v2.0" },
  { mark: "M", name: "Muse Wonder" },
  { mark: "M", name: "Microsoft-Decision-1" },
  { mark: "D", name: "Drex v1.5" },
  { mark: "C", name: "Clef Omni" },
];

function InfoButton({ label }: { label: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            aria-label="Information"
            className="text-muted-foreground hover:text-foreground"
          >
            <Info className="size-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function Section({
  title,
  desc,
  children,
}: {
  title: string;
  desc: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-4 border-t py-6 md:grid-cols-[240px_1fr] md:gap-8">
      <div>
        <h2 className="font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

function ToggleRow({
  icon,
  title,
  desc,
  checked,
  onChange,
}: {
  icon?: React.ReactNode;
  title: string;
  desc: React.ReactNode;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 border-b px-4 py-4 last:border-0">
      {icon}
      <div className="min-w-0 flex-1">
        <p className="font-medium">{title}</p>
        <div className="mt-0.5 text-sm text-muted-foreground">{desc}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={title} />
    </div>
  );
}

export default function PrivacyPage() {
  // TODO(backend): 各项数据策略真实取值
  const [zdr, setZdr] = useState<Record<string, boolean>>({});
  const [trainPaid, setTrainPaid] = useState(false);
  const [trainFree, setTrainFree] = useState(true);
  const [publishFree, setPublishFree] = useState(false);
  const [discount, setDiscount] = useState(false);
  const [keyLifetime, setKeyLifetime] = useState("none");
  const [allowedProviders, setAllowedProviders] = useState("");
  const [ignoredProviders, setIgnoredProviders] = useState("");
  const [filterCatalog, setFilterCatalog] = useState(false);

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold">Privacy</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Restrictions to apply globally across the account. You can further
        restrict API keys with guardrails inside a workspace.
      </p>

      <Section title="Data Policies" desc="Set data privacy and usage restrictions.">
        <h3 className="flex items-center gap-1 font-semibold">
          Zero Data Retention
          <InfoButton label="Only route to endpoints with zero data retention" />
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Only route to provider endpoints that don&apos;t store your data.
          Reject requests that would require data retention. Only applies to
          provider routing, does not apply to plugins and tools you choose to
          enable.
        </p>
        <div className="mt-4 rounded-lg border">
          {ZDR_PROVIDERS.map((p) => (
            <ToggleRow
              key={p.id}
              icon={
                p.mark ? (
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-md border bg-muted/50 text-xs font-bold text-muted-foreground">
                    {p.mark}
                  </span>
                ) : (
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-md border bg-muted/50 text-muted-foreground">
                    <Layers className="size-4" />
                  </span>
                )
              }
              title={p.name}
              desc={p.desc}
              checked={!!zdr[p.id]}
              onChange={(v) => setZdr((prev) => ({ ...prev, [p.id]: v }))}
            />
          ))}
        </div>

        <h3 className="mt-8 font-semibold">Data Training</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          These settings are separate from Zero Data Retention. Each endpoint
          toggle controls routing to endpoints with a specific data policy:
          enabling allows requests to be routed to those endpoints, disabling
          excludes them from routing.{" "}
          <Link href="/docs" className="underline underline-offset-4">
            Learn more
          </Link>
        </p>
        <div className="mt-4 rounded-lg border">
          <ToggleRow
            title="Allow paid endpoints that train on request data"
            desc="Enable providers that may anonymously use data for training purposes."
            checked={trainPaid}
            onChange={setTrainPaid}
          />
          <ToggleRow
            title="Allow free endpoints that train on request data"
            desc="Enable providers serving free models that may retain and/or train on prompts and completions."
            checked={trainFree}
            onChange={setTrainFree}
          />
          <ToggleRow
            title="Allow free endpoints that publish prompts"
            desc="Enable providers serving free models that may publish prompts and completions to public datasets."
            checked={publishFree}
            onChange={setPublishFree}
          />
          <ToggleRow
            title="Allow 1% data discount in workspaces"
            desc={`Allow workspaces to consent to ${brand.name} using your inputs/outputs to improve the product. Each workspace consents separately.`}
            checked={discount}
            onChange={setDiscount}
          />
        </div>
      </Section>

      <Section
        title="API key expiry"
        desc="Cap how long API keys under this account may stay valid."
      >
        <p className="font-medium">Maximum API key lifetime</p>
        <p className="mt-1 text-sm text-muted-foreground">
          New keys must expire within this window, and requests from existing
          keys that never expire or expire later are rejected. Choose
          &quot;No expiration&quot; to allow any lifetime.
        </p>
        <Select value={keyLifetime} onValueChange={setKeyLifetime}>
          <SelectTrigger className="mt-3 w-56" aria-label="Maximum API key lifetime">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No expiration</SelectItem>
            <SelectItem value="30d">30 days</SelectItem>
            <SelectItem value="90d">90 days</SelectItem>
            <SelectItem value="180d">180 days</SelectItem>
            <SelectItem value="1y">1 year</SelectItem>
          </SelectContent>
        </Select>
      </Section>

      <Section
        title="Regional routing"
        desc="Where inference runs. Included with Business. There is no setting to turn on: send a request to the EU or US API URL to keep it in that region."
      >
        <div className="flex items-center gap-3 rounded-lg border px-4 py-4">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted/50 text-muted-foreground">
            <Building2 className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
              Business
            </Badge>
            <p className="mt-1 text-sm text-muted-foreground">
              Keep inference inside the EU or the US.
            </p>
          </div>
          <Button
            className="shrink-0"
            onClick={() => alert("套餐升级尚未接入（TODO(backend)）")}
          >
            Upgrade to Business
          </Button>
        </div>
        <Link
          href="/docs"
          className="mt-3 inline-block text-sm underline underline-offset-4"
        >
          How in-region routing works
        </Link>
      </Section>

      <Section
        title="Providers"
        desc="Control which providers are used for routing. Leave empty to allow all."
      >
        <div className="space-y-6">
          <div>
            <p className="font-medium">Allowed Providers</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Exclusively enable these providers for your requests.
            </p>
            <Select value={allowedProviders} onValueChange={setAllowedProviders}>
              <SelectTrigger className="mt-3 w-56">
                <SelectValue placeholder="Add" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="anthropic">Anthropic</SelectItem>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="google">Google</SelectItem>
                <SelectItem value="x-ai">SpaceXAI</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="font-medium">Ignored Providers</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Exclude these providers from serving any requests.
            </p>
            <Select value={ignoredProviders} onValueChange={setIgnoredProviders}>
              <SelectTrigger className="mt-3 w-56">
                <SelectValue placeholder="Add" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="anthropic">Anthropic</SelectItem>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="google">Google</SelectItem>
                <SelectItem value="x-ai">SpaceXAI</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Section>

      <Section
        title="Eligibility Preview"
        desc="Providers and models available based on your account settings."
      >
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">
            635 available | 3 unavailable
          </p>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto"
            onClick={() => alert("完整列表尚未接入（TODO(backend)）")}
          >
            Show All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => alert("筛选尚未接入（TODO(backend)）")}
          >
            New
          </Button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {PREVIEW_MODELS.map((m) => (
            <span
              key={m.name}
              className="inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-sm"
            >
              <span className="flex size-4 items-center justify-center rounded-sm bg-muted text-[10px] font-bold text-muted-foreground">
                {m.mark}
              </span>
              {m.name}
              <InfoButton label={`${m.name} is available under your current settings`} />
            </span>
          ))}
        </div>
      </Section>

      <Section
        title="Model catalog"
        desc="Limit the models API to the models your API keys can use."
      >
        <div className="rounded-lg border">
          <ToggleRow
            title="Filter the model catalog for API keys"
            desc={
              <>
                When on, requests to{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-xs">
                  GET /api/v1/models
                </code>{" "}
                made with an API key from this account only list the models
                the key can actually use, applying your provider restrictions
                and guardrails. Requests without a key still see the public
                catalog.
              </>
            }
            checked={filterCatalog}
            onChange={setFilterCatalog}
          />
        </div>
      </Section>

      <Section
        title="Prompt Injection Allowlist"
        desc="Phrases that should never trigger the prompt injection guardrail. Matching is case-insensitive and exact."
      >
        <p className="text-sm text-muted-foreground">
          Add phrases your users legitimately send that should not trigger the
          prompt injection guardrail. Matching is case-insensitive and exact.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => alert("添加白名单尚未接入（TODO(backend)）")}
        >
          <Plus className="mr-1 size-4" /> Add pattern
        </Button>
        <p className="mt-4 text-sm text-muted-foreground">
          Allowlisted phrases only take effect when the{" "}
          <Link href="/docs" className="underline underline-offset-4">
            prompt injection guardrail
          </Link>{" "}
          is enabled for the request. Without it enabled, these patterns have
          no effect.
        </p>
      </Section>
    </div>
  );
}
