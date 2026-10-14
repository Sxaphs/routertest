<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## 项目约定（人工维护段）

- 品牌与文案只允许读 `src/config/brand.ts`；不引入参照站的 logo/图标/文案原文。
- 数据：唯一在线源是 `/api/v1/models`（经 `src/app/api/models` 代理）；其余 mock 处必须标 `TODO(backend)`。
- 时间/日期格式化固定 UTC（`src/lib/models.ts`），避免 SSR hydration 不匹配；Next 16 预渲染模型下，请求时数据用 `await connection()`。
- 路由组：`(site)` 公开外立面、`(console)` 登录后外壳、`(app)` 一屏高应用页。
- 外部调研工具产生的临时文件一律放项目目录外；不要提交任何第三方站点的原始素材。
