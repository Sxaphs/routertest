"use client";

import { useState } from "react";
import Link from "next/link";
import { Briefcase, MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";
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

/**
 * 账户 Workspaces 列表（内存 mock，TODO(backend): 接 OURBRAND workspaces API）。
 * 结构对齐参照站 /workspaces。
 */

interface Workspace {
  id: string;
  slug: string;
  name: string;
  description: string;
  spendLimit: string; // "No limit" 或 "$100"
  spend: string; // "$0.00"
  keys: number;
}

const INITIAL_WORKSPACES: Workspace[] = [
  {
    id: "w1",
    slug: "default",
    name: "Default Workspace",
    description:
      "The initial workspace for your account. Includes all API Keys, Presets, and other configurations previously created.",
    spendLimit: "No limit",
    spend: "$0.00",
    keys: 1,
  },
];

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(INITIAL_WORKSPACES);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const createWorkspace = () => {
    // TODO(backend): 调真实创建接口
    setWorkspaces((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-") || `ws-${prev.length}`,
        name: name || `Workspace ${prev.length + 1}`,
        description,
        spendLimit: "No limit",
        spend: "$0.00",
        keys: 0,
      },
    ]);
    setOpen(false);
    setName("");
    setDescription("");
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Workspaces</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your workspaces and their configurations.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-1 size-4" /> New workspace
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a new workspace</DialogTitle>
              <DialogDescription>
                Workspaces isolate API keys, presets, and spend limits.（当前为
                mock，不落库）
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm" htmlFor="ws-name">
                  Name
                </label>
                <Input
                  id="ws-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Production"
                />
              </div>
              <div>
                <label className="text-sm" htmlFor="ws-desc">
                  Description
                </label>
                <Input
                  id="ws-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this workspace for?"
                />
              </div>
              <Button onClick={createWorkspace} className="w-full">
                Create workspace
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              {["Name", "Description", "Spend", "Keys", "Actions"].map((h) => (
                <th key={h} className="p-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {workspaces.map((w) => (
              <tr key={w.id} className="border-b last:border-0">
                <td className="p-3">
                  <span className="flex items-center gap-2 font-medium">
                    <Briefcase className="size-4 text-muted-foreground" />
                    {w.name}
                  </span>
                </td>
                <td className="max-w-md truncate p-3 text-muted-foreground">
                  {w.description}
                </td>
                <td className="p-3">
                  <span className="flex items-center justify-between gap-6">
                    <span className="text-muted-foreground">{w.spendLimit}</span>
                    <span>
                      {w.spend} / {w.spendLimit === "No limit" ? "∞" : w.spendLimit}
                    </span>
                  </span>
                </td>
                <td className="p-3">
                  <Link
                    href={`/workspaces/${w.slug}/keys`}
                    className="underline underline-offset-4"
                  >
                    {w.keys}
                  </Link>
                </td>
                <td className="p-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Workspace actions"
                      >
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          alert("编辑工作区尚未接入（TODO(backend)）")
                        }
                      >
                        <Pencil className="mr-2 size-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={w.slug === "default"}
                        onClick={() =>
                          setWorkspaces((prev) =>
                            prev.filter((x) => x.id !== w.id),
                          )
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
    </div>
  );
}
