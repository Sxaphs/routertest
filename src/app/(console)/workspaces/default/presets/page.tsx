import Link from "next/link";
import { Plus, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * 工作区 Presets（当前为空态 mock，TODO(backend): 接 OURBRAND presets API）。
 * 结构对齐参照站 /workspaces/default/presets（a11y 终态为空态）。
 */
export default function PresetsPage() {
  // TODO(backend): 拉取真实 preset 列表；有数据时渲染表格
  const presets: unknown[] = [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Presets</h1>
        <Button asChild>
          <Link href="/workspaces/default/presets/new">
            <Plus className="mr-1 size-4" /> New Preset
          </Link>
        </Button>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Presets are shortcuts for your system prompts, model and provider
        configurations, and request parameters.
      </p>

      {presets.length === 0 && (
        <div className="mt-16 flex flex-col items-center justify-center gap-2 text-center">
          <SlidersHorizontal className="size-8 text-muted-foreground" />
          <p className="font-medium">No presets yet</p>
          <p className="text-sm text-muted-foreground">
            Create a preset to save your model + parameter configuration.
          </p>
        </div>
      )}
    </div>
  );
}
