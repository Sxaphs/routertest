import { cn } from "@/lib/utils";

/**
 * 提供方/作者图标占位：首字母色块。
 * 不使用参照站的 favicon 图标资产；TODO(brand): 未来换自有图标体系。
 */
const PALETTE = [
  "bg-[#7624f4]/10 text-[#7624f4]",
  "bg-[#035ade]/10 text-[#035ade]",
  "bg-[#ff6849]/10 text-[#ff6849]",
  "bg-[#00c49f]/10 text-[#00806a]",
  "bg-[#ffab00]/10 text-[#9a6700]",
];

export function ProviderIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const initial = (name[0] ?? "?").toUpperCase();
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  const color = PALETTE[hash % PALETTE.length];
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex size-6 shrink-0 items-center justify-center rounded-md text-xs font-bold",
        color,
        className,
      )}
    >
      {initial}
    </span>
  );
}
