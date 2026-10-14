"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowUp,
  Download,
  Eraser,
  Hourglass,
  PanelLeft,
  Plus,
  Search,
  Settings,
  Settings2,
  SquarePen,
  Trash2,
  X,
} from "lucide-react";
import {
  authorOf,
  fetchCatalog,
  type CatalogModel,
} from "@/lib/models";
import { ProviderIcon } from "@/components/provider-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/**
 * /chat Playground。结构对齐参照站；对话回复为本地 mock（TODO(backend): 接 OURBRAND /v1/chat/completions）。
 */

interface Params {
  temperature: number;
  top_p: number;
  max_tokens: number;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  modelId?: string;
}

interface Column {
  model: CatalogModel;
  params: Params;
  messages: Message[];
  /** 排队状态（模拟限流演示，TODO(backend): 真实限流由网关返回 429 + Retry-After） */
  queued?: { position: number; eta: number } | null;
}

const DEFAULT_PARAMS: Params = { temperature: 1, top_p: 1, max_tokens: 1024 };

const SUGGESTIONS = [
  { title: "Car Wash Test", body: "Should you walk or drive to the car wash?" },
  { title: "9.9 vs 9.11", body: "Which one is larger?" },
  { title: "Strawberry Test", body: "How many r's are in the word strawberry?" },
  { title: "Poem Riddle", body: "Compose a 12-line poem about the sea." },
];

const MODEL_GROUPS = [
  "Flagship models",
  "Best roleplay models",
  "Best coding models",
  "Reasoning models",
];

/** mock 回复（TODO(backend)） */
function mockReply(model: CatalogModel, prompt: string, params: Params): string {
  void params;
  return `[mock reply · ${model.name}]\n\nYou said: "${prompt}".\n\nOnce the backend is wired, this will be the real streamed output of ${model.id} via the OURBRAND API, with temperature and friends sent along.`;
}

function ModelPicker({
  models,
  onPick,
}: {
  models: CatalogModel[];
  onPick: (m: CatalogModel) => void;
}) {
  const [q, setQ] = useState("");
  const filtered = useMemo(
    () =>
      models
        .filter(
          (m) =>
            !q ||
            m.name.toLowerCase().includes(q.toLowerCase()) ||
            m.id.includes(q.toLowerCase()),
        )
        .slice(0, 50),
    [models, q],
  );
  return (
    <div className="absolute left-0 top-10 z-30 w-[420px] rounded-lg border bg-popover shadow-lg">
      <div className="flex items-center gap-2 border-b p-2">
        <Search className="ml-1 size-4 text-muted-foreground" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search models"
          className="w-full bg-transparent text-sm outline-none"
          aria-label="Search models"
        />
        <span className="shrink-0 text-xs text-muted-foreground">
          {models.length} models
        </span>
      </div>
      <ul className="max-h-80 overflow-y-auto p-1">
        {filtered.map((m) => (
          <li key={m.id}>
            <button
              onClick={() => onPick(m)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent"
            >
              <ProviderIcon name={authorOf(m)} className="size-5" />
              {m.name.split(": ").slice(1).join(": ") || m.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ParamsPopover({
  params,
  onChange,
}: {
  params: Params;
  onChange: (p: Params) => void;
}) {
  return (
    <PopoverContent className="w-72">
      <p className="mb-3 text-sm font-semibold">Model parameters（mock）</p>
      {(
        [
          ["temperature", 0, 2, 0.1],
          ["top_p", 0, 1, 0.05],
        ] as const
      ).map(([key, min, max, step]) => (
        <div key={key} className="mb-3">
          <div className="mb-1 flex justify-between text-sm">
            <label htmlFor={`p-${key}`}>{key}</label>
            <span className="text-muted-foreground">{params[key]}</span>
          </div>
          <input
            id={`p-${key}`}
            type="range"
            min={min}
            max={max}
            step={step}
            value={params[key]}
            onChange={(e) =>
              onChange({ ...params, [key]: Number(e.target.value) })
            }
            className="w-full accent-[#7624f4]"
          />
        </div>
      ))}
      <div className="mb-1 flex justify-between text-sm">
        <label htmlFor="p-max-tokens">max_tokens</label>
      </div>
      <Input
        id="p-max-tokens"
        type="number"
        value={params.max_tokens}
        onChange={(e) =>
          onChange({ ...params, max_tokens: Number(e.target.value) || 0 })
        }
      />
      <p className="mt-3 text-xs text-muted-foreground">
        Sent with each request (TODO(backend))
      </p>
    </PopoverContent>
  );
}

export function ChatPlayground() {
  const [catalog, setCatalog] = useState<CatalogModel[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [columns, setColumns] = useState<Column[]>([]);
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandAll, setExpandAll] = useState(false);
  const [metricsInline, setMetricsInline] = useState(true);
  const sp = useSearchParams();
  const [queueSim, setQueueSim] = useState(
    () => sp.get("queuesim") === "1", // ?queuesim=1 便于演示/测试排队态
  );
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCatalog().then(setCatalog).catch(() => {});
  }, []);

  useEffect(() => {
    // 只滚动内部容器，不带动整页
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [columns]);

  // 排队倒计时：每秒钟推进一次，归零后产出 mock 回复
  useEffect(() => {
    if (!columns.some((c) => c.queued)) return;
    const t = setInterval(() => {
      setColumns((prev) =>
        prev.map((c) => {
          if (!c.queued) return c;
          const eta = c.queued.eta - 1;
          if (eta > 0) {
            return {
              ...c,
              queued: { position: Math.max(1, Math.ceil(eta / 3)), eta },
            };
          }
          const lastUser = [...c.messages].reverse().find((m) => m.role === "user");
          return {
            ...c,
            queued: null,
            messages: [
              ...c.messages,
              {
                role: "assistant",
                content: mockReply(c.model, lastUser?.content ?? "", c.params),
                modelId: c.model.id,
              },
            ],
          };
        }),
      );
    }, 1000);
    return () => clearInterval(t);
  }, [columns]);

  const addModel = (m: CatalogModel) => {
    setColumns((prev) =>
      prev.some((c) => c.model.id === m.id)
        ? prev
        : [...prev, { model: m, params: { ...DEFAULT_PARAMS }, messages: [] }],
    );
    setPickerOpen(false);
  };

  const send = (text: string) => {
    const prompt = text.trim();
    if (!prompt || columns.length === 0) return;
    setColumns((prev) =>
      prev.map((c) => {
        const withUser: Message[] = [...c.messages, { role: "user", content: prompt }];
        if (queueSim) {
          // 模拟限流：进入排队而非立即回复
          return {
            ...c,
            messages: withUser,
            queued: { position: 3, eta: 8 },
          };
        }
        return {
          ...c,
          messages: [
            ...withUser,
            // TODO(backend): POST /v1/chat/completions 流式返回
            {
              role: "assistant",
              content: mockReply(c.model, prompt, c.params),
              modelId: c.model.id,
            },
          ],
        };
      }),
    );
    setInput("");
  };

  return (
    <div className="flex h-full">
      {/* 房间侧栏 */}
      {sidebarOpen && (
        <aside className="hidden w-60 shrink-0 flex-col border-r p-3 md:flex">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-semibold">Chat</span>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle sidebar"
              onClick={() => setSidebarOpen(false)}
            >
              <PanelLeft className="size-4" />
            </Button>
          </div>
          <Button variant="outline" className="justify-start" onClick={() => setColumns([])}>
            <SquarePen className="mr-2 size-4" /> New chat
            <kbd className="ml-auto text-xs text-muted-foreground">⌘/</kbd>
          </Button>
          <div className="relative mt-2">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input placeholder="Search rooms..." className="pl-8" aria-label="Search rooms..." />
          </div>
          <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
            <span>0 rooms</span>
            <button className="hover:text-foreground">Select</button>
          </div>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            No matching rooms
          </p>
        </aside>
      )}

      {/* 主区 */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* 工具行 */}
        <div className="flex items-center justify-between border-b px-4 py-2">
          <div className="relative">
            <Button variant="outline" onClick={() => setPickerOpen(!pickerOpen)}>
              Add Model
              <kbd className="ml-2 text-xs text-muted-foreground">⌘J</kbd>
            </Button>
            {pickerOpen && <ModelPicker models={catalog} onPick={addModel} />}
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="outline">List</Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Room settings">
                  <Settings className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuItem onClick={() => alert("Export not wired yet (TODO(backend))")}>
                  <Download className="mr-2 size-4" /> Export
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setColumns([])}>
                  <Eraser className="mr-2 size-4" /> Clear Models
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    setColumns((prev) => prev.map((c) => ({ ...c, messages: [] })))
                  }
                >
                  <Trash2 className="mr-2 size-4" /> Clear Chat
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="flex items-center justify-between px-2 py-1.5 text-sm">
                  Always expand messages
                  <Switch checked={expandAll} onCheckedChange={setExpandAll} />
                </div>
                <div className="flex items-center justify-between px-2 py-1.5 text-sm">
                  Show metrics inline
                  <Switch checked={metricsInline} onCheckedChange={setMetricsInline} />
                </div>
                <DropdownMenuSeparator />
                <div className="flex items-center justify-between px-2 py-1.5 text-sm">
                  <span>
                    Simulate rate limiting
                    <span className="block text-xs text-muted-foreground">
                      Demo the request-queue UI (our feature)
                    </span>
                  </span>
                  <Switch checked={queueSim} onCheckedChange={setQueueSim} />
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* 内容区 */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
          {columns.length === 0 ? (
            <div className="mx-auto max-w-3xl">
              <div className="grid grid-cols-2 gap-4">
                {MODEL_GROUPS.map((g) => (
                  <button
                    key={g}
                    onClick={() => setPickerOpen(true)}
                    className="rounded-lg border p-4 text-left transition-colors hover:border-primary/40"
                  >
                    <p className="font-semibold">{g}</p>
                    <div className="mt-6 flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <span key={i} className="size-5 rounded-full bg-muted" />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div
              className={cn(
                "mx-auto grid max-w-6xl gap-4",
                columns.length > 1 ? "md:grid-cols-2" : "grid-cols-1",
              )}
            >
              {columns.map((col) => (
                <div key={col.model.id} className="flex flex-col rounded-lg border">
                  {/* 模型列头 */}
                  <div className="flex items-center gap-2 border-b px-3 py-2">
                    <ProviderIcon name={authorOf(col.model)} className="size-5" />
                    <span className="truncate text-sm font-medium">
                      {col.model.name.split(": ").slice(1).join(": ") || col.model.name}
                    </span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Model parameters">
                          <Settings2 className="size-4" />
                        </Button>
                      </PopoverTrigger>
                      <ParamsPopover
                        params={col.params}
                        onChange={(p) =>
                          setColumns((prev) =>
                            prev.map((c) =>
                              c.model.id === col.model.id ? { ...c, params: p } : c,
                            ),
                          )
                        }
                      />
                    </Popover>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Remove model"
                      onClick={() =>
                        setColumns((prev) =>
                          prev.filter((c) => c.model.id !== col.model.id),
                        )
                      }
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                  {/* 消息 */}
                  <div className="flex-1 space-y-3 p-3">
                    {col.messages.length === 0 && (
                      <p className="pt-6 text-center text-sm text-muted-foreground">
                        Start the conversation…
                      </p>
                    )}
                    {col.messages.map((msg, i) => (
                      <div
                        key={i}
                        className={cn(
                          "rounded-lg px-3 py-2 text-sm whitespace-pre-wrap",
                          msg.role === "user"
                            ? "ml-auto max-w-[85%] bg-primary text-primary-foreground"
                            : "mr-auto max-w-[95%] bg-muted",
                          !expandAll && msg.role === "assistant" && "line-clamp-[20]",
                        )}
                      >
                        {msg.content}
                        {metricsInline && msg.role === "assistant" && (
                          <span className="mt-1 block text-xs text-muted-foreground">
                            mock · temp {col.params.temperature} · max_tokens{" "}
                            {col.params.max_tokens}
                          </span>
                        )}
                      </div>
                    ))}
                    {/* 请求排队状态（模拟限流，自有功能） */}
                    {col.queued && (
                      <div className="mr-auto flex max-w-[95%] items-center gap-3 rounded-lg border border-dashed bg-muted/50 px-3 py-2 text-sm">
                        <Hourglass className="size-4 animate-pulse text-primary" />
                        <span>
                          Queued · position <b>#{col.queued.position}</b> · ~<b>{col.queued.eta}s</b> left
                        </span>
                        <button
                          className="ml-auto text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                          onClick={() =>
                            setColumns((prev) =>
                              prev.map((c) =>
                                c.model.id === col.model.id
                                  ? { ...c, queued: null }
                                  : c,
                              ),
                            )
                          }
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                    <div ref={bottomRef} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 建议 chips */}
        {columns.length === 0 && (
          <div className="flex gap-2 overflow-x-auto px-4 pb-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s.title}
                onClick={() => setInput(s.body)}
                className="shrink-0 rounded-lg border px-3 py-2 text-left hover:border-primary/40"
              >
                <p className="text-sm font-medium">{s.title}</p>
                <p className="max-w-40 truncate text-xs text-muted-foreground">
                  {s.body}
                </p>
              </button>
            ))}
          </div>
        )}

        {/* 输入区 */}
        <div className="border-t px-4 py-3">
          <div className="mx-auto flex max-w-4xl items-center gap-2 rounded-full border px-3 py-1.5">
            <Button variant="ghost" size="icon" aria-label="Attachments">
              <Plus className="size-4" />
            </Button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send(input)}
              placeholder="Ask anything…"
              aria-label="Ask anything…"
              className="w-full bg-transparent text-sm outline-none"
            />
            <Button
              size="icon"
              className="rounded-full"
              aria-label="Send"
              disabled={columns.length === 0 || !input.trim()}
              onClick={() => send(input)}
            >
              <ArrowUp className="size-4" />
            </Button>
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Responses are AI-generated and can be inaccurate. Review all outputs
            before relying on them.
          </p>
        </div>
      </div>
    </div>
  );
}
