/** 确定性 hash：所有 mock 数据派生的基础（SSR/客户端一致、刷新不变） */
export function hashStr(s: string): number {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}
