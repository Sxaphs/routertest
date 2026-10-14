"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * 「限额与保险丝」配置弹窗（key 级 / 终端用户级共用）。
 * 打开时用 initial* 播种草稿，保存回调返回原始字符串（由调用方解析）。
 */
export function LimitFuseDialog({
  open,
  onOpenChange,
  title,
  description,
  initialLimit,
  initialAutoFuse,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  initialLimit: string;
  initialAutoFuse: boolean;
  onSave: (limit: string, autoFuse: boolean) => void;
}) {
  const [limit, setLimit] = useState(initialLimit);
  const [autoFuse, setAutoFuse] = useState(initialAutoFuse);

  useEffect(() => {
    if (open) {
      setLimit(initialLimit);
      setAutoFuse(initialAutoFuse);
    }
  }, [open, initialLimit, initialAutoFuse]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm" htmlFor="lf-limit">
              Monthly limit (USD, empty = unlimited)
            </label>
            <Input
              id="lf-limit"
              inputMode="decimal"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              placeholder="e.g. 50"
            />
          </div>
          <label className="flex items-center justify-between text-sm">
            <span>
              Auto-fuse on overspend
              <span className="block text-xs text-muted-foreground">
                Off = notify via alert channels only
              </span>
            </span>
            <Switch checked={autoFuse} onCheckedChange={setAutoFuse} />
          </label>
          <Button className="w-full" onClick={() => onSave(limit, autoFuse)}>
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
