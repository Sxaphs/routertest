"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import {
  authorOf,
  fetchCatalog,
  type CatalogModel,
} from "@/lib/models";
import { ProviderIcon } from "@/components/provider-icon";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

/**
 * ⌘K 全局搜索面板（结构对齐参照站：输入框 + 分组列表 + 底部快捷键提示）。
 * 数据源：公开模型目录（本地过滤）；页面/动作为静态清单。
 */

const PAGES = [
  { href: "/models", label: "Models" },
  { href: "/chat", label: "Chat Playground" },
  { href: "/rankings", label: "Rankings" },
  { href: "/settings/keys", label: "API Keys" },
  { href: "/settings/credits", label: "Credits" },
  { href: "/activity", label: "Activity" },
  { href: "/logs", label: "Logs" },
  { href: "/workspaces", label: "Workspaces" },
  { href: "/settings/profile", label: "Profile" },
  { href: "/settings/preferences", label: "Preferences" },
  { href: "/sign-in", label: "Sign In" },
  { href: "/sign-up", label: "Sign Up" },
] as const;

export function SearchPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [catalog, setCatalog] = useState<CatalogModel[]>([]);
  const router = useRouter();

  // ⌘K / Ctrl+K 快捷键
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // 首次打开时拉目录
  useEffect(() => {
    if (open && catalog.length === 0) {
      fetchCatalog().then(setCatalog).catch(() => {});
    }
  }, [open, catalog.length]);

  const go = useCallback(
    (href: string) => {
      setOpen(false);
      setQ("");
      router.push(href as Parameters<typeof router.push>[0]);
    },
    [router],
  );

  const query = q.trim().toLowerCase();

  const modelResults = useMemo(() => {
    if (!query) return [];
    return catalog
      .filter(
        (m) =>
          m.id.toLowerCase().includes(query) ||
          m.name.toLowerCase().includes(query),
      )
      .slice(0, 12);
  }, [catalog, query]);

  const providers = useMemo(() => {
    const seen = new Map<string, number>();
    for (const m of catalog) {
      const a = authorOf(m);
      seen.set(a, (seen.get(a) ?? 0) + 1);
    }
    return [...seen.entries()]
      .sort((x, y) => y[1] - x[1])
      .slice(0, 14)
      .map(([a]) => a);
  }, [catalog]);

  const pageResults = useMemo(
    () => PAGES.filter((p) => p.label.toLowerCase().includes(query)),
    [query],
  );

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="ml-2 hidden w-56 justify-between text-muted-foreground sm:flex"
        aria-label="Search"
      >
        <span className="flex items-center gap-2">
          <Search className="size-4" /> Search
        </span>
        <kbd className="pointer-events-none flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px]">
          ⌘K
        </kbd>
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search"
        description="Search models, providers and pages"
      >
        <CommandInput
          value={q}
          onValueChange={setQ}
          placeholder="Search models, providers, pages..."
        />
        <CommandList>
          <CommandEmpty>
            {query ? "No results found." : "Start typing to search models, providers, and pages."}
          </CommandEmpty>

          {modelResults.length > 0 && (
            <CommandGroup heading="Models">
              {modelResults.map((m) => (
                <CommandItem
                  key={m.id}
                  value={`${m.name} ${m.id}`}
                  onSelect={() => go(`/${m.id}`)}
                >
                  <ProviderIcon name={authorOf(m)} className="size-5" />
                  <span>{m.name.split(": ").slice(1).join(": ") || m.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {m.id}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {!query && providers.length > 0 && (
            <CommandGroup heading="Providers">
              {providers.map((p) => (
                <CommandItem
                  key={p}
                  value={p}
                  onSelect={() => go(`/models?q=${encodeURIComponent(p)}`)}
                >
                  <ProviderIcon name={p} className="size-5" />
                  <span className="capitalize">{p}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {pageResults.length > 0 && (
            <>
              {(modelResults.length > 0 || (!query && providers.length > 0)) && (
                <CommandSeparator />
              )}
              <CommandGroup heading="Pages">
                {pageResults.map((p) => (
                  <CommandItem
                    key={p.href}
                    value={p.label}
                    onSelect={() => go(p.href)}
                  >
                    <span>{p.label}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {p.href}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
        <div className="flex items-center gap-4 border-t px-3 py-2 text-xs text-muted-foreground">
          <span>↑↓ Navigate</span>
          <span>⏎ Select</span>
          <span className="ml-auto">⌘K</span>
        </div>
      </CommandDialog>
    </>
  );
}
