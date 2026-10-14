"use client";

import { Download, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  MOCK_STATEMENTS,
  MOCK_WITHDRAWALS,
  SETTLEMENT,
  type Statement,
} from "@/mocks/distribution";
import { downloadCsv } from "@/lib/csv";


/** 生成该月 mock 对账单 CSV。TODO(backend): 换服务端生成的完整对账单 */
function downloadStatement(s: Statement) {
  downloadCsv(`statement-${s.id}.csv`, [
    ["Statement", s.month],
    [],
    ["GMV", s.gmv],
    ["Commission", s.commission],
    ["Net payout", s.net],
  ]);
}

/**
 * 分账与对账（/distribution/settlement）：结算周期 + 提现 + 提现记录 + 月度对账单。
 * 全部 mock，TODO(backend): 接分账/提现/发票接口。
 */
export default function DistributionSettlementPage() {
  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settlement</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Payouts, statements, and invoices for your reseller earnings.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => alert("Invoices not wired yet (TODO(backend))")}
        >
          <FileText className="mr-1 size-4" />
          Request invoice
        </Button>
      </div>

      {/* 当前结算周期 */}
      <Card className="mt-6">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Current period · {SETTLEMENT.period}
            </p>
            <p className="mt-1 text-4xl font-extrabold">
              {SETTLEMENT.withdrawable}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Withdrawable balance ({SETTLEMENT.currency})
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => alert("Withdrawals not wired yet (TODO(backend))")}
          >
            Withdraw
          </Button>
        </CardContent>
      </Card>

      {/* 提现记录 */}
      <h2 className="mt-10 text-lg font-bold">Withdrawal history</h2>
      <div className="mt-4 overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              {["Date", "Amount", "Method", "Status"].map((h) => (
                <th key={h} className="p-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_WITHDRAWALS.map((w) => (
              <tr key={w.id} className="border-b last:border-0">
                <td className="p-3 text-muted-foreground">{w.date}</td>
                <td className="p-3">{w.amount}</td>
                <td className="p-3 text-muted-foreground">{w.method}</td>
                <td className="p-3">
                  <Badge
                    className={
                      w.status === "Paid"
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                    }
                  >
                    {w.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 月度对账单 */}
      <h2 className="mt-10 text-lg font-bold">Statements</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        One statement per settlement month. Download the CSV for your books.
      </p>
      <div className="mt-4 overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              {["Month", "GMV", "Commission", "Net payout", ""].map((h) => (
                <th key={h} className="p-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_STATEMENTS.map((s) => (
              <tr key={s.id} className="border-b last:border-0">
                <td className="p-3 font-medium">{s.month}</td>
                <td className="p-3">{s.gmv}</td>
                <td className="p-3 text-muted-foreground">{s.commission}</td>
                <td className="p-3">{s.net}</td>
                <td className="p-3">
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadStatement(s)}
                    >
                      <Download className="mr-1 size-3.5" />
                      Download CSV
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
