"use client";

import { useState } from "react";
import {
  Filter,
  KeyRound,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/**
 * 工作区 Guardrails（全部内存 mock，TODO(backend): 接 OURBRAND guardrails API）。
 * 结构对齐参照站 /workspaces/default/guardrails。
 */

interface Guardrail {
  id: string;
  name: string;
  isDefault: boolean;
  description: string;
  status: "Active" | "Disabled";
  policies: string;
  members: string;
  apiKeys: string;
}

const INITIAL_GUARDRAILS: Guardrail[] = [
  {
    id: "g1",
    name: "Workspace Guardrail",
    isDefault: true,
    description:
      "Default policy automatically applied to every key in this workspace.",
    status: "Active",
    policies: "No policies",
    members: "All",
    apiKeys: "All",
  },
];

const STATUS_OPTIONS = ["All", "Active", "Disabled"] as const;

export default function GuardrailsPage() {
  const [guardrails, setGuardrails] = useState<Guardrail[]>(INITIAL_GUARDRAILS);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<(typeof STATUS_OPTIONS)[number]>("All");

  const filtered = guardrails.filter(
    (g) =>
      (!search || g.name.toLowerCase().includes(search.toLowerCase())) &&
      (status === "All" || g.status === status),
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Guardrails</h1>
        <Button
          onClick={() => alert("创建 Guardrail 尚未接入（TODO(backend)）")}
        >
          <Plus className="mr-1 size-4" /> New Guardrail
        </Button>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Set spending limits, data privacy rules, and model/provider restrictions
        for API keys in this workspace.
      </p>

      <div className="mt-6 rounded-lg border">
        <div className="flex items-center gap-2 border-b p-3">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name..."
              className="pl-8"
              aria-label="Search by name..."
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                aria-label="Filter guardrails by status"
              >
                <Filter className="mr-1 size-4" />
                {status === "All" ? "Status" : status}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {STATUS_OPTIONS.map((s) => (
                <DropdownMenuItem key={s} onClick={() => setStatus(s)}>
                  {s}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Policies</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>API Keys</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((g) => (
              <TableRow key={g.id}>
                <TableCell className="whitespace-normal">
                  <p className="flex items-center gap-2 font-medium">
                    {g.name}
                    {g.isDefault && (
                      <Badge variant="secondary">Default</Badge>
                    )}
                  </p>
                  <p className="max-w-md truncate text-sm text-muted-foreground">
                    {g.description}
                  </p>
                </TableCell>
                <TableCell>
                  <Badge className="border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                    {g.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {g.policies}
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <Users className="size-4" /> {g.members}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <KeyRound className="size-4" /> {g.apiKeys}
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Row actions"
                      >
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          alert("编辑 Guardrail 尚未接入（TODO(backend)）")
                        }
                      >
                        <Pencil className="mr-2 size-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={g.isDefault}
                        onClick={() =>
                          setGuardrails((prev) =>
                            prev.filter((x) => x.id !== g.id),
                          )
                        }
                      >
                        <Trash2 className="mr-2 size-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <p className="p-3 text-sm text-muted-foreground">
          {filtered.length} guardrail{filtered.length === 1 ? "" : "s"}
        </p>
      </div>
    </div>
  );
}
