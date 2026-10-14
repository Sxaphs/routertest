import { connection } from "next/server";
import type { Metadata } from "next";
import { RankingsView } from "@/components/rankings-view";
import { getCatalogServer } from "@/lib/models";

export const metadata: Metadata = {
  title: "Rankings",
  description: "Live model rankings by real-world token usage.",
};

// 动态路由参数无关，但上游取数：允许阻塞渲染（Next 16）
export const instant = false;


export default async function RankingsPage() {
  const models = await getCatalogServer();
  // 请求时渲染（Next 16 不允许在预渲染中用 Date.now()）
  await connection();
  const dataThrough = new Date(Date.now() - 86400000).toLocaleDateString(
    "en-US",
    { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" },
  );
  return <RankingsView models={models} dataThrough={dataThrough} />;
}
