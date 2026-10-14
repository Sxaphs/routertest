"use client";

import { useRef, useState } from "react";
import { FileText, Folder, RefreshCw, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

/**
 * 工作区 Files（Beta，全部内存 mock，TODO(backend): 接 OURBRAND Files API 上传/列举）。
 * 结构对齐参照站 /workspaces/default/files。
 */

interface MockFile {
  name: string;
  size: number;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function WorkspaceFilesPage() {
  const [apiEnabled, setApiEnabled] = useState(true);
  const [files, setFiles] = useState<MockFile[]>([]); // TODO(backend): 真实文件列表
  const [refreshing, setRefreshing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const refresh = () => {
    // TODO(backend): 重新拉取文件列表
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  const onPick = (list: FileList | null) => {
    if (!list?.length) return;
    // TODO(backend): 真实上传；当前仅内存暂存
    setFiles((prev) => [
      ...prev,
      ...Array.from(list).map((f) => ({ name: f.name, size: f.size })),
    ]);
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          Files
          <Badge variant="secondary">Beta</Badge>
        </h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            aria-label="Refresh files"
            onClick={refresh}
          >
            <RefreshCw className={refreshing ? "size-4 animate-spin" : "size-4"} />
          </Button>
          <Button onClick={() => inputRef.current?.click()}>
            <Upload className="mr-1 size-4" /> Upload
          </Button>
          <input
            ref={inputRef}
            type="file"
            multiple
            hidden
            onChange={(e) => {
              onPick(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      <div className="mt-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold">Files API</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Enable the Files API for this workspace: upload files, reference
            them in sandbox containers, and retrieve files produced by the
            shell and bash tools. Read more in our{" "}
            {/* TODO(backend): 替换为自有文档地址 */}
            <a href="#" className="underline underline-offset-4">
              docs
            </a>
            .
          </p>
        </div>
        <Switch
          checked={apiEnabled}
          onCheckedChange={setApiEnabled}
          aria-label="Toggle the Files API"
        />
      </div>

      <nav aria-label="Folder path" className="mt-4 flex items-center gap-1 text-sm text-muted-foreground">
        <Folder className="size-4" />
        <button disabled className="font-medium">
          /
        </button>
      </nav>

      <div className="mt-3 rounded-lg border">
        {files.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-14">
            <FileText className="size-8 text-muted-foreground/60" />
            <p className="font-semibold">No files here yet</p>
            <p className="max-w-sm text-center text-sm text-muted-foreground">
              Upload a file to get started. Use a folder path like
              &ldquo;reports/2024/&rdquo; to organize files.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="p-3 font-medium">Name</th>
                <th className="p-3 font-medium">Size</th>
              </tr>
            </thead>
            <tbody>
              {files.map((f) => (
                <tr key={f.name} className="border-b last:border-0">
                  <td className="p-3">{f.name}</td>
                  <td className="p-3 text-muted-foreground">
                    {formatSize(f.size)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p className="border-t p-3 text-sm text-muted-foreground">
          {files.length} item{files.length === 1 ? "" : "s"}
        </p>
      </div>
    </div>
  );
}
