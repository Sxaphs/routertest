/** CSV 生成与浏览器下载（带 BOM 方便 Excel 识别 UTF-8） */

function escapeCell(v: string | number): string {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(rows: (string | number)[][]): string {
  return rows.map((r) => r.map(escapeCell).join(",")).join("\n");
}

/** 触发浏览器下载（Blob，UTF-8） */
export function downloadCsv(filename: string, rows: (string | number)[][]): void {
  const blob = new Blob(["﻿" + toCsv(rows)], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
