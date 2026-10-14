"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { brand } from "@/config/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

/**
 * 工作区 Settings（全部内存 mock，TODO(backend): 接 OURBRAND 工作区设置）。
 * 结构对齐参照站 /workspaces/default/settings。
 */

// TODO(backend): 从后端拉取工作区元信息（mock 字面量，勿用 Date.now）
const WORKSPACE = {
  created: "Oct 13, 2026, 3:37 PM UTC",
  id: "5c8b667f-d96e-56bb-b798-5a13b77a66bc",
  name: "Default Workspace",
};

function Section({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6 rounded-lg border p-6">
      <h2 className="text-lg font-bold">{title}</h2>
      {desc && <p className="mt-1 text-sm text-muted-foreground">{desc}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function WorkspaceSettingsPage() {
  const [name, setName] = useState(WORKSPACE.name);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(WORKSPACE.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // 剪贴板不可用时忽略
    }
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage your workspace identity, spending controls, and integrations.
      </p>

      <dl className="mt-6 rounded-lg border px-4 py-3 text-sm">
        <div className="flex gap-4 border-b py-2">
          <dt className="w-20 shrink-0 text-muted-foreground">Created</dt>
          <dd>{WORKSPACE.created}</dd>
        </div>
        <div className="flex items-center gap-4 py-2">
          <dt className="w-20 shrink-0 text-muted-foreground">ID</dt>
          <dd>
            <button
              type="button"
              onClick={copyId}
              aria-label="Copy workspace ID"
              className="flex items-center gap-1.5 font-mono hover:underline"
            >
              {WORKSPACE.id}
              {copied ? (
                <Check className="size-3.5 text-green-600" />
              ) : (
                <Copy className="size-3.5 text-muted-foreground" />
              )}
            </button>
          </dd>
        </div>
      </dl>

      <Section
        title="General"
        desc="Manage this workspace’s identity and URL."
      >
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <p className="font-medium">Name</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Shown across {brand.name} and to workspace members.
            </p>
          </div>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My workspace"
            aria-label="Name"
            className="w-64 shrink-0"
          />
        </div>
      </Section>

      <Section
        title="Budgets & data"
        desc="Manage spending limits and data sharing."
      >
        <h3 className="font-semibold">Workspace budget</h3>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Set daily, weekly, monthly, or lifetime spending limits.
        </p>
        <div className="mt-3 flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            No limit set — this workspace can spend any amount.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => alert("预算设置尚未接入（TODO(backend)）")}
          >
            Add budget
          </Button>
        </div>
        <div className="mt-5 flex items-center justify-between gap-4 border-t pt-4">
          <div className="min-w-0">
            <p className="font-medium">Include BYOK spend</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Count usage made with provider keys toward these limits.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add a budget to enable this setting.
            </p>
          </div>
          <Switch disabled aria-label="Include BYOK spend" />
        </div>
      </Section>

      <Section
        title="Video generation"
        desc="Configure delivery and verification for generated videos."
      >
        <p className="font-medium">Default webhook URL</p>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Receives video generation delivery events for this workspace.
        </p>
        <Input
          value={webhookUrl}
          onChange={(e) => setWebhookUrl(e.target.value)}
          placeholder="https://example.com/webhook"
          aria-label="Default webhook URL"
          className="mt-2 max-w-md"
        />
        <div className="mt-5 border-t pt-4">
          <p className="font-medium">Webhook signing secret</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Used to verify webhook payload signatures.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            No signing secret configured.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                alert("签名密钥生成尚未接入（TODO(backend)）")
              }
            >
              Generate signing secret
            </Button>
            <Button size="sm" disabled>
              Save
            </Button>
          </div>
        </div>
      </Section>

      <Section title="Delete workspace">
        <p className="text-sm text-muted-foreground">
          You can&apos;t delete your only workspace. Create another first.
        </p>
        <Button variant="destructive" size="sm" className="mt-3" disabled>
          Delete
        </Button>
      </Section>
    </div>
  );
}
