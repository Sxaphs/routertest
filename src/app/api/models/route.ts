import { NextResponse } from "next/server";
import { getCatalogServer } from "@/lib/models";

/**
 * 公开模型目录代理。缓存 1 小时（由 getCatalogServer 内的 revalidate 实现）。
 * TODO(backend): 换成 OURBRAND 自有模型目录接口。
 */
export async function GET() {
  const data = await getCatalogServer();
  if (data.length === 0) {
    return NextResponse.json({ error: "upstream unavailable" }, { status: 502 });
  }
  return NextResponse.json({ data, total_count: data.length });
}
