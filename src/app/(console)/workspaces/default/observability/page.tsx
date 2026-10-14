"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

/**
 * 工作区 Observability（全部内存 mock，TODO(backend): 接 OURBRAND 日志/广播配置）。
 * 结构对齐参照站 /workspaces/default/observability。
 */

interface Destination {
  name: string;
  beta?: boolean;
  /** 占位 favicon 底色（第三方 logo 不可用，用首字母占位） */
  color: string;
}

// TODO(backend): 从后端拉取可用广播目标
const DESTINATIONS: Destination[] = [
  { name: "Arize AX", color: "bg-rose-500" },
  { name: "Braintrust", color: "bg-violet-500" },
  { name: "ClickHouse", color: "bg-yellow-500" },
  { name: "Comet Opik", color: "bg-orange-400" },
  { name: "Datadog", color: "bg-purple-600" },
  { name: "Elastic Observability", beta: true, color: "bg-teal-500" },
  { name: "Google BigQuery", beta: true, color: "bg-blue-500" },
  { name: "Grafana Cloud", color: "bg-orange-600" },
  { name: "Langfuse", color: "bg-sky-500" },
  { name: "LangSmith", color: "bg-emerald-500" },
  { name: "New Relic AI", color: "bg-cyan-600" },
  { name: "OpenTelemetry Collector", color: "bg-indigo-500" },
  { name: "PostHog", color: "bg-blue-600" },
  { name: "Raindrop", beta: true, color: "bg-fuchsia-500" },
  { name: "Ramp", color: "bg-lime-600" },
  { name: "S3 / S3-Compatible", color: "bg-amber-600" },
  { name: "Sentry", color: "bg-pink-600" },
  { name: "Snowflake", color: "bg-sky-400" },
  { name: "W&B Weave", color: "bg-amber-500" },
  { name: "Webhook", color: "bg-slate-500" },
];

export default function WorkspaceObservabilityPage() {
  const [ioLogging, setIoLogging] = useState(false);
  const [broadcast, setBroadcast] = useState(false);

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold">Observability</h1>

      <div className="mt-6 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 font-semibold">
            Input &amp; Output Logging
            <Badge variant="secondary" className="font-normal">
              Beta
            </Badge>
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Show prompts and completions in your{" "}
            <Link
              href="/workspaces/default/logs"
              className="underline underline-offset-4"
            >
              logs
            </Link>{" "}
            for debugging, evaluating responses, and optimizing prompts.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="I/O logging settings"
            onClick={() => alert("I/O logging 设置尚未接入（TODO(backend)）")}
          >
            <Settings className="size-4" />
          </Button>
          <Switch
            checked={ioLogging}
            onCheckedChange={setIoLogging}
            aria-label="Toggle prompt storage"
          />
        </div>
      </div>

      <div className="mt-8 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="font-semibold">Broadcast</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Automatically send traces from your requests to external
            observability platforms without additional instrumentation.{" "}
            <Link href="#" className="underline underline-offset-4">
              Learn more
            </Link>
          </p>
        </div>
        <Switch
          checked={broadcast}
          onCheckedChange={setBroadcast}
          aria-label="Toggle observability broadcast features"
          className="shrink-0"
        />
      </div>

      <h3 className="mt-8 text-sm font-medium text-muted-foreground">
        Available
      </h3>
      <div className="mt-2 rounded-lg border">
        {DESTINATIONS.map((d) => (
          <div
            key={d.name}
            className="flex items-center justify-between gap-4 border-b px-4 py-3 last:border-0"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span
                aria-hidden
                className={`flex size-7 shrink-0 items-center justify-center rounded-md text-xs font-bold text-white ${d.color}`}
              >
                {d.name.charAt(0)}
              </span>
              <span className="flex items-center gap-2 font-medium">
                {d.name}
                {d.beta && (
                  <Badge variant="secondary" className="font-normal">
                    Beta
                  </Badge>
                )}
              </span>
            </div>
            <span className="flex shrink-0 items-center gap-1 text-sm text-muted-foreground">
              Add Destination
              <Button
                variant="ghost"
                size="icon"
                disabled
                aria-label={`Add ${d.name} destination`}
              >
                <Plus className="size-4" />
              </Button>
            </span>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-lg border p-4">
        <p className="font-medium">Send Feedback</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Let us know how we can improve!
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => alert("反馈渠道尚未接入（TODO(backend)）")}
        >
          Open
        </Button>
      </div>
    </div>
  );
}
