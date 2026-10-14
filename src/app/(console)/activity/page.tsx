"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * 调用日志/用量总览（全部 mock，TODO(backend): 接 OURBRAND analytics）。
 * 结构对齐参照站 /activity（Overview tab）。
 */

const STATS = [
  { label: "Total spend", value: "$0.00" },
  { label: "Requests", value: "0" },
  { label: "Token volume", value: "0" },
  { label: "Cache hit rate", value: "—" },
  { label: "Blended $/1M", value: "—" },
];

const PANELS = ["Top API Keys", "Top Apps", "Top Models", "Top Providers"];

export default function ActivityPage() {
  const [tab, setTab] = useState("overview");
  const [preset, setPreset] = useState("past_1_month");

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Activity</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your usage across models on the platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Filters">
            <SlidersHorizontal className="size-4" />
          </Button>
          <Select value={preset} onValueChange={setPreset}>
            <SelectTrigger className="w-40" aria-label="Date range">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="past_1_day">Past 24 Hours</SelectItem>
              <SelectItem value="past_1_week">Past Week</SelectItem>
              <SelectItem value="past_1_month">Past 1 Month</SelectItem>
              <SelectItem value="past_3_months">Past 3 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mt-4">
        <TabsList>
          {["Overview", "Trends", "Explore", "Guardrails"].map((t) => (
            <TabsTrigger key={t} value={t.toLowerCase()}>
              {t}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {tab !== "overview" ? (
        <div className="mt-6 flex h-48 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
          {tab} 视图待接入（TODO(backend)）
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
            {STATS.map((s) => (
              <Card key={s.label}>
                <CardContent className="pt-4">
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="mt-1 text-2xl font-bold">{s.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    — No prior data
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {PANELS.map((p) => (
              <Card key={p}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold">{p}</h2>
                    <button className="text-sm text-muted-foreground hover:text-foreground">
                      Explore ›
                    </button>
                  </div>
                  <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                    No data in this window
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
