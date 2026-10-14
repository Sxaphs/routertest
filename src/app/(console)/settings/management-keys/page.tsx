"use client";

import { useState } from "react";
import { Info, KeyRound, MoreVertical, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

/**
 * Management Keys 管理（内存 mock，TODO(backend): 接 OURBRAND management keys API）。
 * 结构对齐参照站 /settings/management-keys。
 */

interface ManagementKey {
  id: string;
  name: string;
  preview: string;
  created: string;
}

export default function ManagementKeysPage() {
  const [keys, setKeys] = useState<ManagementKey[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  const createKey = () => {
    // TODO(backend): 调真实创建接口并只在创建时返回完整 key
    setKeys((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: name || `Management key ${prev.length + 1}`,
        preview: `sk-ob-mgmt-${Math.random().toString(36).slice(2, 6)}...`,
        created: "Oct 14, 2026, 6:10 AM UTC",
      },
    ]);
    setOpen(false);
    setName("");
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Management Keys</h1>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            Control your management API keys for administrative actions
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button aria-label="Information">
                    <Info className="size-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  Management keys can create, read, update, and delete inference
                  API keys programmatically.
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
              <DialogTitle>Create a new management key</DialogTitle>
              <DialogDescription>
                The full key is shown only once at creation.（当前为 mock，不落库）
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm" htmlFor="mgmt-key-name">
                  Name
                </label>
                <Input
                  id="mgmt-key-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. CI provisioning"
                />
              </div>
              <Button onClick={createKey} className="w-full">
                Create key
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {keys.length === 0 ? (
        <div className="mt-6 flex h-96 flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-center">
          <KeyRound className="size-6 text-muted-foreground" />
          <p className="mt-2 font-semibold">No management keys yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Create a management API key to perform administrative actions and
            manage inference API keys programmatically.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                {["Name", "Key", "Created"].map((h) => (
                  <th key={h} className="p-3 font-medium">
                    {h}
                  </th>
                ))}
                <th className="w-10 p-3" />
              </tr>
            </thead>
            <tbody>
              {keys.map((k) => (
                <tr key={k.id} className="border-b last:border-0">
                  <td className="p-3 font-medium">{k.name}</td>
                  <td className="p-3 font-mono text-xs text-muted-foreground">
                    {k.preview}
                  </td>
                  <td className="p-3 text-muted-foreground">{k.created}</td>
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
      )}
    </div>
  );
}
