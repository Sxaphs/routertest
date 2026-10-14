"use client";

import { useState } from "react";
import { Info, ListFilter, MoreVertical, RefreshCw, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
 * 工作区 Logs（全部 mock，TODO(backend): 接 OURBRAND /v1/generations 等日志接口）。
 * 结构对齐参照站 /workspaces/default/logs。
 */

function HeaderTip({ text }: { text: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button aria-label={text} className="align-middle">
            <Info className="size-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent>{text}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function WorkspaceLogsPage() {
  const [range, setRange] = useState("1d");
  const [refreshing, setRefreshing] = useState(false);
  // TODO(backend): 真实日志行；当前为空表，对齐参照站空态
  const rows: never[] = [];

  const refresh = () => {
    // TODO(backend): 重新拉取日志
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Logs</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Refresh logs"
            onClick={refresh}
          >
            <RefreshCw className={refreshing ? "size-4 animate-spin" : "size-4"} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Filter by User, Model, Provider, API Key, or Modality"
            onClick={() => alert("过滤器尚未接入（TODO(backend)）")}
          >
            <ListFilter className="size-4" />
          </Button>
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-44" aria-label="Date range">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">1d&nbsp;&nbsp;Past 24 Hours</SelectItem>
              <SelectItem value="7d">7d&nbsp;&nbsp;Past 7 Days</SelectItem>
              <SelectItem value="30d">30d&nbsp;&nbsp;Past 30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="icon"
            aria-label="More options"
            onClick={() => alert("更多操作尚未接入（TODO(backend)）")}
          >
            <MoreVertical className="size-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="generations" className="mt-4">
        <TabsList variant="line">
          <TabsTrigger value="generations">Generations</TabsTrigger>
          <TabsTrigger value="upstream" className="gap-1">
            Upstream Requests
            <HeaderTip text="About upstream requests" />
          </TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="batches">Batches</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-4 overflow-x-auto rounded-lg border">
        <table className="w-full min-w-max text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="whitespace-nowrap p-3 font-medium">Date</th>
              <th className="whitespace-nowrap p-3 font-medium">Model</th>
              <th className="whitespace-nowrap p-3 font-medium">Provider</th>
              <th className="whitespace-nowrap p-3 font-medium">
                App <HeaderTip text="The app or agent that made this request." />
              </th>
              <th className="whitespace-nowrap p-3 font-medium">Input</th>
              <th className="whitespace-nowrap p-3 font-medium">Output</th>
              <th className="whitespace-nowrap p-3 font-medium">Cost</th>
              <th className="whitespace-nowrap p-3 font-medium">Usage Type</th>
              <th className="whitespace-nowrap p-3 font-medium">Speed</th>
              <th className="whitespace-nowrap p-3 font-medium">
                Routing Overhead{" "}
                <HeaderTip text="Time spent routing your request, including provider fallbacks." />
              </th>
              <th className="whitespace-nowrap p-3 font-medium">
                Time to First Token{" "}
                <HeaderTip text="Latency until the first token was received, in seconds." />
              </th>
              <th className="whitespace-nowrap p-3 font-medium">Finish Reason</th>
              <th className="whitespace-nowrap p-3 font-medium">API Key</th>
              <th className="whitespace-nowrap p-3 font-medium">
                <button
                  aria-label="Table settings"
                  className="align-middle hover:text-foreground"
                  onClick={() => alert("表格列设置尚未接入（TODO(backend)）")}
                >
                  <Settings2 className="size-4" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(() => null)}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className="flex flex-col items-center gap-1 py-12">
            <p className="font-semibold">No transactions found</p>
            <p className="text-sm text-muted-foreground">
              Try adjusting the date range or filters to see more data.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
