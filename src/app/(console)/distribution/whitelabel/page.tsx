"use client";

import { useState } from "react";
import { ImagePlus } from "lucide-react";
import { brand } from "@/config/brand";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/** 预设主题色 */
const PRESET_COLORS = ["#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444"];

/**
 * 白标设置（/distribution/whitelabel）：品牌名 / Logo / 主题色 / 自定义域名 + 实时预览。
 * 全部内存 mock，TODO(backend): 持久化白标配置与域名校验。
 */
export default function DistributionWhitelabelPage() {
  const [brandName, setBrandName] = useState("Acme AI");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [domain, setDomain] = useState("");

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold">White-label</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Present the {brand.name} API under your own brand.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* 左栏：表单 */}
        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-5 pt-6">
              <div>
                <label className="text-sm" htmlFor="wl-brand">
                  Brand name
                </label>
                <Input
                  id="wl-brand"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Your brand"
                />
              </div>

              <div>
                <p className="text-sm">Logo</p>
                {/* 上传占位：TODO(backend): 接文件上传 */}
                <button
                  type="button"
                  onClick={() => alert("Logo upload not wired yet (TODO(backend))")}
                  className="mt-1 flex h-28 w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-sm text-muted-foreground hover:bg-accent"
                >
                  <ImagePlus className="size-5" />
                  Click to upload (PNG/SVG, mock)
                </button>
              </div>

              <div>
                <p className="text-sm">Theme color</p>
                <div className="mt-2 flex items-center gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      aria-label={`Theme color ${c}`}
                      onClick={() => setColor(c)}
                      className={cn(
                        "size-8 rounded-full border-2",
                        color === c
                          ? "border-foreground"
                          : "border-transparent",
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    aria-label="Custom theme color"
                    className="size-8 cursor-pointer rounded-full border bg-transparent p-0"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm" htmlFor="wl-domain">
                  Custom domain
                </label>
                <Input
                  id="wl-domain"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="api.yourbrand.com"
                />
                <div className="mt-2 rounded-md border border-dashed p-3 text-xs text-muted-foreground">
                  <p className="font-medium text-foreground">DNS setup</p>
                  <p className="mt-1">
                    1. Add a <span className="font-mono">CNAME</span> record for{" "}
                    <span className="font-mono">{domain || "api.yourbrand.com"}</span>{" "}
                    pointing to{" "}
                    <span className="font-mono">
                      whitelabel.{brand.name.toLowerCase()}.com
                    </span>
                    .
                  </p>
                  <p className="mt-1">
                    2. TLS is issued automatically once the record propagates
                    (usually under 10 minutes).
                  </p>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={() => alert("White-label settings not wired yet (TODO(backend))")}
              >
                Save changes
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 右栏：实时预览（inline style 覆盖主色，不影响全局） */}
        <div>
          <p className="mb-2 text-sm font-medium text-muted-foreground">
            Live preview
          </p>
          <Card>
            <CardContent className="pt-6">
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  <span
                    className="flex size-6 items-center justify-center rounded-md text-xs font-bold text-white"
                    style={{ backgroundColor: color }}
                  >
                    {(brandName || "B")[0].toUpperCase()}
                  </span>
                  <span className="font-semibold">{brandName || "Your brand"}</span>
                </div>
                <p className="mt-4 text-lg font-bold">
                  One API. Every model — by {brandName || "your brand"}.
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Pay-as-you-go pricing on all major models.
                </p>
                <button
                  type="button"
                  className="mt-4 rounded-md px-4 py-2 text-sm font-medium text-white"
                  style={{ backgroundColor: color }}
                >
                  Get API Key
                </button>
                <div className="mt-4 space-y-2">
                  {[
                    ["anthropic/claude-opus-5.5", "$4.80 / $24.00"],
                    ["google/gemini-4-argon", "$2.40 / $12.00"],
                  ].map(([id, price]) => (
                    <div
                      key={id}
                      className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                    >
                      <span className="font-mono text-xs">{id}</span>
                      <span style={{ color }} className="font-medium">
                        {price}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-center text-xs text-muted-foreground">
                  Powered by {brand.name}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
