"use client";

import { useState } from "react";
import { Info, MoreVertical, RefreshCw, Settings2, SlidersHorizontal } from "lucide-react";
import { brand } from "@/config/brand";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * 账户 Logs（Generations 日志，全部 mock 空态，TODO(backend): 接 OURBRAND /logs API）。
 * 结构对齐参照站 /logs。
 */

function HeaderInfo({ label }: { label: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button aria-label={label} className="align-middle">
            <Info className="size-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

const RANGE_OPTIONS = [
  { value: "1h", label: "Past Hour" },
  { value: "1d", label: "Past 24 Hours" },
  { value: "1w", label: "Past Week" },
  { value: "1m", label: "Past Month" },
];

export default function LogsPage() {
  const [range, setRange] = useState("1d");
  const [refreshing, setRefreshing] = useState(false);

  const refresh = () => {
    // TODO(backend): 重新拉取日志
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  // TODO(backend): 真实日志行；当前恒为空以匹配空态证据
  const rows: never[] = [];

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Logs</h1>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Refresh logs"
            onClick={refresh}
          >
            <RefreshCw className={refreshing ? "size-4 animate-spin" : "size-4"} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Filter by User, Model, Provider, API Key, or Modality"
            onClick={() => alert("过滤器尚未接入（TODO(backend)）")}
          >
            <SlidersHorizontal className="size-4" />
          </Button>
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger
              className="w-44"
              aria-label="Date range"
            >
              <span className="mr-2 rounded bg-muted px-1.5 py-0.5 text-xs">
                {range}
              </span>
              {RANGE_OPTIONS.find((o) => o.value === range)?.label}
            </SelectTrigger>
            <SelectContent>
              {RANGE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="ghost" size="icon" aria-label="More options">
            <MoreVertical className="size-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="generations" className="mt-4">
        <TabsList className="h-auto w-full justify-start gap-4 rounded-none border-b bg-transparent p-0">
          {[
            { value: "generations", label: "Generations" },
            { value: "upstream", label: "Upstream Requests" },
            { value: "sessions", label: "Sessions" },
            { value: "videos", label: "Videos" },
            { value: "batches", label: "Batches" },
          ].map((t) => (
            <TabsTrigger
              key={t.value}
              value={t.value}
              className="rounded-none border-b-2 border-transparent px-1 pb-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
            >
              {t.label}
              {t.value === "upstream" && (
                <HeaderInfo label="About upstream requests" />
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="generations">
          <div className="mt-4 overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="p-3 font-medium">Date</th>
                  <th className="p-3 font-medium">Model</th>
                  <th className="p-3 font-medium">Provider</th>
                  <th className="p-3 font-medium">
                    <span className="inline-flex items-center gap-1">
                      App
                      <HeaderInfo label="The app or agent that made this request." />
                    </span>
                  </th>
                  <th className="p-3 font-medium">Input</th>
                  <th className="p-3 font-medium">Output</th>
                  <th className="p-3 font-medium">Cost</th>
                  <th className="p-3 font-medium">Usage Type</th>
                  <th className="p-3 font-medium">Speed</th>
                  <th className="p-3 font-medium">
                    <span className="inline-flex items-center gap-1">
                      Routing Overhead
                      <HeaderInfo
                        label={`Time ${brand.name} spent routing your request, including provider fallbacks.`}
                      />
                    </span>
                  </th>
                  <th className="p-3 font-medium">
                    <span className="inline-flex items-center gap-1">
                      Time to First Token
                      <HeaderInfo label="Latency until the first token was received, in seconds." />
                    </span>
                  </th>
                  <th className="p-3 font-medium">Finish Reason</th>
                  <th className="p-3 font-medium">API Key</th>
                  <th className="w-10 p-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Table settings"
                      onClick={() =>
                        alert("表格列设置尚未接入（TODO(backend)）")
                      }
                    >
                      <Settings2 className="size-4" />
                    </Button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map(() => null)}
              </tbody>
            </table>
            <div className="flex flex-col items-center justify-center gap-1 py-16 text-center">
              <p className="font-semibold">No transactions found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting the date range or filters to see more data.
              </p>
            </div>
          </div>
        </TabsContent>

        {["upstream", "sessions", "videos", "batches"].map((v) => (
          <TabsContent key={v} value={v}>
            <div className="mt-4 flex flex-col items-center justify-center gap-1 rounded-lg border py-16 text-center">
              <p className="font-semibold">No transactions found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting the date range or filters to see more data.
              </p>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
