import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCatalogServer, type CatalogModel } from "@/lib/models";
import { ModelDetail } from "@/components/model-detail";

// 动态路由 + 上游取数：允许阻塞渲染（Next 16 预渲染模型）
export const instant = false;

/** TODO(backend): 换成 OURBRAND 自有目录接口 */
async function getModel(id: string): Promise<CatalogModel | null> {
  const all = await getCatalogServer();
  return all.find((m) => m.id === id) ?? null;
}

export async function generateMetadata({
  params,
}: PageProps<"/[author]/[model]">): Promise<Metadata> {
  const { author, model } = await params;
  const m = await getModel(`${author}/${model}`);
  return { title: m?.name ?? `${author}/${model}` };
}

export default async function ModelDetailPage({
  params,
}: PageProps<"/[author]/[model]">) {
  const { author, model } = await params;
  const m = await getModel(`${author}/${model}`);
  if (!m) notFound();
  return <ModelDetail model={m} />;
}
