"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, Settings } from "lucide-react";
import { brand } from "@/config/brand";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * 工作区 Tools（全部内存 mock，TODO(backend): 接 OURBRAND 工作区工具配置）。
 * 结构对齐参照站 /workspaces/default/tools。
 */

const B = brand.name.toLowerCase();

interface ServerTool {
  id: string;
  name: string;
  slug: string;
  desc: string;
  thirdParty?: boolean;
  hasSettings?: boolean;
}

interface ToolGroup {
  title: string;
  tools: ServerTool[];
}

// TODO(backend): 从后端拉取工具目录与启用状态
const TOOL_GROUPS: ToolGroup[] = [
  {
    title: "Web access",
    tools: [
      {
        id: "web_search",
        name: "Web Search",
        slug: "web-search",
        desc: "Real-time web search during a generation. The model's search queries and the retrieved results are handled by third-party search providers.",
        thirdParty: true,
        hasSettings: true,
      },
      {
        id: "web_fetch",
        name: "Web Fetch",
        slug: "web-fetch",
        desc: "Fetches the contents of a URL the model asks for and returns it as text.",
        thirdParty: true,
        hasSettings: true,
      },
    ],
  },
  {
    title: "Multi-model",
    tools: [
      {
        id: "advisor",
        name: "Advisor",
        slug: "advisor",
        desc: "Lets the model consult a stronger advisor model mid-generation, sending it the conversation so far.",
      },
      {
        id: "subagent",
        name: "Subagent",
        slug: "subagent",
        desc: "Delegates sub-tasks to a smaller, faster worker model, sending it the task content.",
      },
      {
        id: "fusion",
        name: "Fusion",
        slug: "fusion",
        desc: "Runs a panel of models plus an analyst over the request, sending the prompt to every panelist.",
      },
    ],
  },
  {
    title: "Code execution",
    tools: [
      {
        id: "shell",
        name: "Shell",
        slug: "shell",
        desc: "Hosted shell for the Responses and Messages APIs, backed by the same sandboxed container as Bash.",
      },
      {
        id: "bash",
        name: "Bash",
        slug: "bash",
        desc: "Runs model-authored shell commands in an isolated sandboxed container. Messages API only.",
      },
    ],
  },
  {
    title: "Files and editing",
    tools: [
      {
        id: "apply_patch",
        name: "Apply Patch",
        slug: "apply-patch",
        desc: "Lets the model propose file edits as V4A diff patches for your application to apply.",
      },
    ],
  },
  {
    title: "Utilities",
    tools: [
      {
        id: "image_generation",
        name: "Image Generation",
        slug: "image-generation",
        desc: "Generates images from a prompt the model supplies, routed to an image model.",
      },
      {
        id: "datetime",
        name: "Datetime",
        slug: "datetime",
        desc: `Gives the model the current date and time. Runs entirely on ${brand.name}.`,
      },
      {
        id: "tool_search",
        name: "Tool Search",
        slug: "tool-search",
        desc: "Lets the model load your own tool definitions on demand instead of up front.",
      },
      {
        id: "experimental__search_models",
        name: "Search Models",
        slug: "search-models",
        desc: `Lets the model search the ${brand.name} model catalog. Experimental.`,
      },
    ],
  },
];

function ToolRow({
  tool,
  enabled,
  onToggle,
}: {
  tool: ServerTool;
  enabled: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b px-4 py-4 last:border-0">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{tool.name}</span>
          <Link
            href="#"
            aria-label={`${tool.name} docs`}
            className="text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="size-3.5" />
          </Link>
          {tool.thirdParty && (
            <Badge variant="secondary" className="font-normal">
              Third-party data
            </Badge>
          )}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{tool.desc}</p>
        <p className="mt-1 font-mono text-xs text-muted-foreground">
          {B}:{tool.id}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {tool.hasSettings && (
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Settings for ${tool.name}`}
            onClick={() =>
              alert(`${tool.name} 设置尚未接入（TODO(backend)）`)
            }
          >
            <Settings className="size-4" />
          </Button>
        )}
        <Switch
          checked={enabled}
          onCheckedChange={onToggle}
          aria-label={`Toggle ${tool.name}`}
        />
      </div>
    </div>
  );
}

export default function WorkspaceToolsPage() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      TOOL_GROUPS.flatMap((g) => g.tools.map((t) => [t.id, true])),
    ),
  );

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold">Tools</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Configure server tools and plugins for your workspace.
      </p>

      <Tabs defaultValue="server-tools" className="mt-6">
        <TabsList>
          <TabsTrigger value="server-tools">Server Tools</TabsTrigger>
          <TabsTrigger value="plugins">Plugins</TabsTrigger>
        </TabsList>
        <TabsContent value="server-tools">
          <p className="mt-4 text-sm text-muted-foreground">
            Control which server tools can be used by requests in this
            workspace. Disallowing a tool rejects any request that asks for it
            with a 403 error. Read more about each tool in our{" "}
            <Link href="#" className="underline underline-offset-4">
              docs
            </Link>
            .
          </p>

          {TOOL_GROUPS.map((group) => (
            <div key={group.title} className="mt-6">
              <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {group.title}
              </h3>
              <div className="mt-2 rounded-lg border">
                {group.tools.map((tool) => (
                  <ToolRow
                    key={tool.id}
                    tool={tool}
                    enabled={enabled[tool.id] ?? true}
                    onToggle={(v) =>
                      setEnabled((prev) => ({ ...prev, [tool.id]: v }))
                    }
                  />
                ))}
              </div>
            </div>
          ))}
        </TabsContent>
        <TabsContent value="plugins">
          <div className="mt-4 flex h-32 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
            No plugins installed（TODO(backend)）
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
