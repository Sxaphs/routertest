# OURBRAND Web

Token API 聚合平台前端（第一版）。Next.js App Router + TypeScript + Tailwind CSS + shadcn/ui，支持暗色模式。

## 运行

```bash
npm install
npm run dev        # http://localhost:3000
```

Node.js 24.11+（或 22.19+ / 26+）。

## 技术栈

Next.js 16 (App Router, Turbopack) · TypeScript · Tailwind CSS v4 · shadcn/ui (radix-ui) · next-themes

## 功能范围

- 公开站：首页、模型目录（搜索/筛选/排序）、模型详情、用量排行、认证页 UI
- 用户控制台：API Keys、余额与充值、调用日志、费用保险丝、账户与工作区设置
- 分销商后台：概览、终端用户管理、定价管理、分账对账、白标设置（顶栏视角切换）
- Playground：多模型并排对话、参数调节、限流排队演示
- ⌘K 全局搜索、亮/暗双主题、移动端自适应

## 目录

```
src/app/(site)/       公开站页面
src/app/(console)/    控制台页面（/settings/* /activity /workspaces/* /distribution/*）
src/app/(app)/chat    Playground（一屏高应用布局）
src/app/api/models    模型目录代理（缓存 1h）
src/components/       页面组件与外壳
src/config/brand.ts   品牌名、logo 占位、全部营销文案
src/lib/              数据层与工具（models / csv / utils）
src/mocks/            全部 mock 数据与派生生成器（对接点标 TODO(backend)）
```

## 数据约定

- 模型目录经 `/api/models` 代理拉取并缓存；其余数据均为确定性 mock，集中在 `src/mocks/`。
- 将来接真实后端的位置统一以 `// TODO(backend)` 标注。
- 品牌与文案只允许读 `src/config/brand.ts`。
- 设计 token（亮/暗双主题）在 `src/app/globals.css`。
