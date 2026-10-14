"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  PRICE_TIERS,
  REPRESENTATIVE_MODELS,
} from "@/mocks/distribution";

/** 当前生效的批发档（mock：中间档 Growth） */
const CURRENT_TIER = 1;

const fmt = (n: number) =>
  `$${n.toFixed(n < 1 ? 4 : 2).replace(/\.?0+$/, "")}`;

/**
 * 定价管理（/distribution/pricing）：批发阶梯价目 + 零售价倍率 + 实时毛利预览。
 * 全部内存 mock，TODO(backend): 接真实档约与价目接口。
 */
export default function DistributionPricingPage() {
  const [multiplier, setMultiplier] = useState(1.2);
  const discount = PRICE_TIERS[CURRENT_TIER].discount;

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold">Pricing</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Your wholesale tier and the retail markup your end users pay.
      </p>

      {/* 批发阶梯价目 */}
      <h2 className="mt-6 text-lg font-bold">Wholesale tiers</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Deeper monthly commitment unlocks a bigger discount off official list
        prices.
      </p>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {PRICE_TIERS.map((t, i) => (
          <Card
            key={t.name}
            className={cn(i === CURRENT_TIER && "border-primary ring-1 ring-primary")}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{t.name}</h3>
                {i === CURRENT_TIER && <Badge>Current</Badge>}
              </div>
              <p className="mt-2 text-2xl font-extrabold">
                {Math.round(t.discount * 100)}% off
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Commitment: {t.commitment}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 零售价倍率 */}
      <Card className="mt-8">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Retail price multiplier</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                End users pay official list price × this multiplier.
              </p>
            </div>
            <span className="text-2xl font-extrabold tabular-nums">
              ×{multiplier.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min={0.8}
            max={2.0}
            step={0.05}
            value={multiplier}
            onChange={(e) => setMultiplier(Number(e.target.value))}
            aria-label="Retail price multiplier"
            className="mt-4 w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>×0.80 (below list)</span>
            <span>×2.00</span>
          </div>
        </CardContent>
      </Card>

      {/* 实时预览 */}
      <h2 className="mt-8 text-lg font-bold">Live margin preview</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Per 1M tokens, at your current {PRICE_TIERS[CURRENT_TIER].name} tier (
        {Math.round(discount * 100)}% wholesale discount) and ×
        {multiplier.toFixed(2)} multiplier.
      </p>
      <div className="mt-4 overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              {[
                "Model",
                "Retail in / out",
                "Wholesale in / out",
                "Margin in / out",
              ].map((h) => (
                <th key={h} className="p-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {REPRESENTATIVE_MODELS.map((m) => {
              const retailIn = m.officialInput * multiplier;
              const retailOut = m.officialOutput * multiplier;
              const wholeIn = m.officialInput * (1 - discount);
              const wholeOut = m.officialOutput * (1 - discount);
              return (
                <tr key={m.id} className="border-b last:border-0">
                  <td className="p-3 font-medium">{m.id}</td>
                  <td className="p-3">
                    {fmt(retailIn)} / {fmt(retailOut)}
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {fmt(wholeIn)} / {fmt(wholeOut)}
                  </td>
                  <td
                    className={cn(
                      "p-3",
                      retailIn - wholeIn >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400",
                    )}
                  >
                    {fmt(retailIn - wholeIn)} / {fmt(retailOut - wholeOut)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
