"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * 账户偏好设置（交互为内存 mock，TODO(backend): 接 OURBRAND 用户设置）。
 * 结构对齐参照站 /settings/preferences。
 */

function Row({
  title,
  desc,
  children,
}: {
  title: string;
  desc: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b px-4 py-4 last:border-0">
      <div className="min-w-0">
        <p className="font-medium">{title}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{desc}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export default function PreferencesPage() {
  const [analytics, setAnalytics] = useState(true);
  const [browserNotif, setBrowserNotif] = useState(false);
  const [dateFormat, setDateFormat] = useState("default");
  const [preset, setPreset] = useState("none");

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold">Preferences</h1>

      <div className="mt-6 rounded-lg border">
        <Row title="User" desc="Manage your login credentials, security settings, or delete your account.">
          <Button variant="outline" size="sm">Manage</Button>
        </Row>
        <Row title="Organization" desc="Create and manage your organization.">
          <Button variant="outline" size="sm">Create</Button>
        </Row>
        <Row
          title="Account Type"
          desc={
            <>
              Your current account tier. Top-up platform fee 5.5%.{" "}
              <span className="underline">Learn more</span>
              <span className="ml-2 inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs">
                Tier&nbsp;<b>Standard</b>
              </span>
            </>
          }
        >
          <Button variant="outline" size="sm">Manage</Button>
        </Row>
        <Row title="Date Format" desc="How dates appear in logs and activity tables.">
          <Select value={dateFormat} onValueChange={setDateFormat}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="iso">ISO 8601</SelectItem>
              <SelectItem value="relative">Relative</SelectItem>
            </SelectContent>
          </Select>
        </Row>
        <Row title="Default Preset" desc="Default preset for new messages in the chatroom.">
          <Select value={preset} onValueChange={setPreset}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
            </SelectContent>
          </Select>
        </Row>
        <Row title="Enable analytics cookies" desc="Allow analytics cookies to help us improve the user experience and site performance.">
          <Switch checked={analytics} onCheckedChange={setAnalytics} />
        </Row>
        <Row title="Browser Notifications" desc="Browser notifications when chat responses complete (only when tab is not focused)">
          <Switch checked={browserNotif} onCheckedChange={setBrowserNotif} />
        </Row>
      </div>
    </div>
  );
}
