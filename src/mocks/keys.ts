/** API Keys 相关 mock。TODO(backend): 接 OURBRAND /v1/keys */

export interface ApiKey {
  id: string;
  name: string;
  preview: string; // sk-ob-v1-xxx...yyy
  expires: string;
  lastUsed: string;
  usage: string;
  limit: string;
  /** 独立保险丝配置（里程碑一新增），undefined = 未配置 */
  fuse?: KeyFuseConfig;
}

export interface KeyFuseConfig {
  monthlyLimit: number | null; // 美元/月
  autoFuse: boolean; // 超限自动熔断
}

export const INITIAL_KEYS: ApiKey[] = [
  {
    id: "k1",
    name: "Default key",
    preview: "sk-ob-v1-807...c31",
    expires: "Apr 11, 2027, 3:37 PM UTC",
    lastUsed: "Never",
    usage: "$0.000",
    limit: "$100",
  },
];

export function randomPreview(): string {
  const a = Math.random().toString(36).slice(2, 5);
  const b = Math.random().toString(36).slice(2, 5);
  return `sk-ob-v1-${a}...${b}`;
}
