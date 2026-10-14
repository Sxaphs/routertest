/** 费用保险丝（/settings/protection）相关 mock。TODO(backend): 接 OURBRAND 防护配置与触发记录 */

export interface ProtectionSettings {
  enabled: boolean;
  monthlyBudget: number | null; // 美元
  dailyBudget: number | null;
  overspendPolicy: "alert_only" | "auto_fuse";
  loopSensitivity: "low" | "medium" | "high";
  channels: { email: boolean; webhook: boolean; wechat: boolean };
}

export const DEFAULT_PROTECTION: ProtectionSettings = {
  enabled: true,
  monthlyBudget: 200,
  dailyBudget: 20,
  overspendPolicy: "alert_only",
  loopSensitivity: "medium",
  channels: { email: true, webhook: false, wechat: false },
};

export const SENSITIVITY_COPY: Record<ProtectionSettings["loopSensitivity"], string> = {
  low: "Low: flag only when the same prompt repeats 50+ times within a minute. Fewest false positives.",
  medium:
    "Medium: flag at 20 repeats of one prompt per minute, or 10 identical responses in a row. Recommended.",
  high: "High: flag at just 5 repeats per minute. Good for debugging; may flag normal polling.",
};

export interface FuseEvent {
  id: string;
  time: string;
  keyName: string;
  reason: "Overspend" | "Repeated calls";
  action: "Alert" | "Fused";
  resolved: boolean;
}

export const MOCK_FUSE_EVENTS: FuseEvent[] = [
  {
    id: "fe-01",
    time: "Oct 13, 2026, 4:02 PM UTC",
    keyName: "Default key",
    reason: "Overspend",
    action: "Alert",
    resolved: true,
  },
  {
    id: "fe-02",
    time: "Oct 13, 2026, 9:47 PM UTC",
    keyName: "CI test key",
    reason: "Repeated calls",
    action: "Fused",
    resolved: false,
  },
  {
    id: "fe-03",
    time: "Oct 14, 2026, 2:15 AM UTC",
    keyName: "Default key",
    reason: "Repeated calls",
    action: "Fused",
    resolved: false,
  },
];

/** localStorage 键位（熔断演示状态） */
export const FUSE_STORAGE = {
  /** 当前生效的熔断（全局横幅据此显示），JSON：{ reason, keyName, time } */
  triggered: "ourbrand.fuse.triggered",
  /** 横幅 dismiss 记录 */
  dismissed: "ourbrand.fuse.dismissed",
} as const;
