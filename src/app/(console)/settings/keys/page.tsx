"use client";

import { useState } from "react";
import { Copy, Info, MoreVertical, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { INITIAL_KEYS, randomPreview, type ApiKey } from "@/mocks/keys";
import { LimitFuseDialog } from "@/components/limit-fuse-dialog";

/**
 * API Keys 管理（全部内存 mock，TODO(backend): 接 OURBRAND /v1/keys）。
 * 结构对齐参照站 /workspaces/default/keys；「限额与保险丝」列为自有功能。
 */

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>(INITIAL_KEYS);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [limit, setLimit] = useState("");
  /** 限额与保险丝弹窗状态 */
  const [fuseKeyId, setFuseKeyId] = useState<string | null>(null);

  const filtered = keys.filter(
    (k) =>
      !search ||
      k.name.toLowerCase().includes(search.toLowerCase()) ||
      k.preview.includes(search),
  );

  const openFuseDialog = (k: ApiKey) => setFuseKeyId(k.id);

  const saveFuse = (limit: string, autoFuse: boolean) => {
    // TODO(backend): 保存 key 级限额与保险丝配置
    setKeys((prev) =>
      prev.map((k) =>
        k.id === fuseKeyId
          ? { ...k, fuse: { monthlyLimit: limit ? Number(limit) : null, autoFuse } }
          : k,
      ),
    );
    setFuseKeyId(null);
  };

  const createKey = () => {
    // TODO(backend): 调真实创建接口并只在创建时返回完整 key
    setKeys((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: name || `Key ${prev.length + 1}`,
        preview: randomPreview(),
        expires: "Never",
        lastUsed: "Never",
        usage: "$0.000",
        limit: limit ? `$${limit}` : "No limit",
      },
    ]);
    setOpen(false);
    setName("");
    setLimit("");
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">API Keys</h1>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            Create and manage your API keys.
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="size-3.5" />
                </TooltipTrigger>
                <TooltipContent>
                  Keys authenticate requests to the API.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-1 size-4" /> New Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a new API key</DialogTitle>
              <DialogDescription>
                The full key is shown only once at creation. (mock — nothing is persisted)
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm" htmlFor="key-name">
                  Name
                </label>
                <Input
                  id="key-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Production server"
                />
              </div>
              <div>
                <label className="text-sm" htmlFor="key-limit">
                  Credit limit (optional)
                </label>
                <Input
                  id="key-limit"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  placeholder="e.g. 100"
                  inputMode="decimal"
                />
              </div>
              <Button onClick={createKey} className="w-full">
                Create key
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-6 rounded-lg border">
        <div className="border-b p-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or paste a key..."
              className="pl-8"
              aria-label="Search by name or paste a key..."
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="w-10 p-3">
                  <Checkbox aria-label="Select all rows" />
                </th>
                {["Key", "Guardrails", "Expires", "Last Used", "Key usage", "Key limit", "Limit & fuse"].map(
                  (h) => (
                    <th key={h} className="p-3 font-medium">
                      {h}
                    </th>
                  ),
                )}
                <th className="w-10 p-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((k) => (
                <tr key={k.id} className="border-b last:border-0">
                  <td className="p-3">
                    <Checkbox aria-label={`Select ${k.name}`} />
                  </td>
                  <td className="p-3">
                    <p className="font-medium">{k.name}</p>
                    <p className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
                      {k.preview}
                      <button
                        aria-label="Copy key preview"
                        className="hover:text-foreground"
                        onClick={() => navigator.clipboard.writeText(k.preview)}
                      >
                        <Copy className="size-3" />
                      </button>
                    </p>
                  </td>
                  <td className="p-3 text-muted-foreground">No guardrails</td>
                  <td className="p-3 text-muted-foreground">{k.expires}</td>
                  <td className="p-3 text-muted-foreground">{k.lastUsed}</td>
                  <td className="p-3">{k.usage}</td>
                  <td className="p-3">{k.limit}</td>
                  {/* 限额与保险丝（自有功能） */}
                  <td className="p-3">
                    <button
                      className="flex items-center gap-2 text-left hover:opacity-80"
                      onClick={() => openFuseDialog(k)}
                    >
                      {k.fuse?.monthlyLimit ? (
                        <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                          ${k.fuse.monthlyLimit}/mo
                          {k.fuse.autoFuse ? " · Fuse" : " · Alert"}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">Not configured</span>
                      )}
                      <span className="text-xs text-primary">Configure</span>
                    </button>
                  </td>
                  <td className="p-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Row actions">
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            setKeys((prev) => prev.filter((x) => x.id !== k.id))
                          }
                        >
                          <Trash2 className="mr-2 size-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="p-3 text-sm text-muted-foreground">
          {filtered.length} key{filtered.length === 1 ? "" : "s"}
        </p>
      </div>

      {/* 限额与保险丝配置弹窗（自有功能，mock） */}
      <LimitFuseDialog
        open={fuseKeyId !== null}
        onOpenChange={(v) => !v && setFuseKeyId(null)}
        title="Limit & fuse"
        description="Set a monthly limit and overspend action for this key. (mock, TODO(backend)) Falls back to account-level spend protection when unset."
        initialLimit={
          keys.find((k) => k.id === fuseKeyId)?.fuse?.monthlyLimit?.toString() ?? ""
        }
        initialAutoFuse={keys.find((k) => k.id === fuseKeyId)?.fuse?.autoFuse ?? true}
        onSave={saveFuse}
      />
    </div>
  );
}
