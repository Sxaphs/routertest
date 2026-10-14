import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/**
 * 工作区 Classifiers（Beta，空态 mock，TODO(backend): 接 OURBRAND 分类器 CRUD）。
 * 结构对齐参照站 /workspaces/default/classifiers。
 */
export default function WorkspaceClassifiersPage() {
  // TODO(backend): 从后端拉取分类器列表；当前为空态
  const classifiers: unknown[] = [];

  return (
    <div className="max-w-3xl">
      <h1 className="flex items-center gap-2 text-2xl font-bold">
        Classifiers
        <Badge variant="secondary" className="font-normal">
          Beta
        </Badge>
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Tag every generation with structured metadata for AI usage reporting.
        View aggregated charts in the Activity page. Create up to 10
        classifiers per workspace.
      </p>

      {classifiers.length === 0 && (
        <div className="mt-6 flex flex-col items-center rounded-lg border border-dashed px-6 py-12 text-center">
          <h3 className="text-lg font-semibold">No classifiers configured</h3>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            A classifier runs a cheap model over every generation and tags it
            with structured metadata you define — department, task type,
            sensitivity, etc. Tags power org-wide dashboards without exposing
            prompt content to leadership.
          </p>
          <Button asChild className="mt-6">
            <Link href="/workspaces/default/classifiers/new">
              Create classifier
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
