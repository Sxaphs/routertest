"use client";

import { useEffect, useState } from "react";
import { ScrollText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/lib/format";
import {
  getAuditLog,
  subscribeAuditLog,
  type AuditLogEntry,
} from "@/mocks/admin";

/**
 * 全局操作日志：聚合所有运营操作（审核通过/驳回、回填 TxHash、出金解冻、
 * 冻结用户、标记证据）。会话内实时追加（跨页面 pub/sub），种子为确定性历史。
 * TODO(backend): GET /v1/admin/audit-log（游标分页 + area 过滤）
 */

const AREA_LABELS: Record<AuditLogEntry["area"], string> = {
  review: "Review",
  reconciliation: "Reconciliation",
  dispute: "Dispute",
  payout: "Payout",
};

export default function AdminAuditPage() {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [area, setArea] = useState("all");

  // 挂载后订阅全局日志（localStorage/SSR 不涉及，但统一在 effect 内取数）
  useEffect(() => {
    const refresh = () => setEntries([...getAuditLog()]);
    refresh();
    return subscribeAuditLog(refresh);
  }, []);

  const filtered = entries.filter((e) => area === "all" || e.area === area);

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">Audit Log</h1>
        <Badge className="bg-primary/15 text-primary">
          <ScrollText className="mr-1 size-3" />
          {filtered.length} entries
        </Badge>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Every operator action is recorded here — approvals, rejections, payout
        TxHash backfills, payout-queue unfreezes, user freezes and dispute
        evidence marks. (mock, in-session; TODO(backend): persisted audit log)
      </p>

      <div className="mt-4">
        <Select value={area} onValueChange={setArea}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All areas</SelectItem>
            {Object.entries(AREA_LABELS).map(([v, label]) => (
              <SelectItem key={v} value={v}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              {["Time", "Actor", "Area", "Action", "Target", "Reason"].map((h) => (
                <th key={h} className="p-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((e, i) => (
              <tr key={`${e.at}-${i}`} className="border-b last:border-0">
                <td className="p-3 text-muted-foreground">{formatDate(e.at)}</td>
                <td className="p-3">{e.actor}</td>
                <td className="p-3">
                  <Badge variant="secondary">{AREA_LABELS[e.area]}</Badge>
                </td>
                <td className="p-3 font-medium">{e.action}</td>
                <td className="p-3 font-mono text-xs">{e.target}</td>
                <td className="p-3 text-muted-foreground">{e.reason ?? "—"}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-muted-foreground">
                  No audit entries match the filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* 游标分页占位 TODO(backend): cursor= 参数 */}
      <div className="mt-3 flex justify-end">
        <Button variant="outline" size="sm" disabled>
          Next page (cursor pagination, TODO(backend))
        </Button>
      </div>
    </div>
  );
}
