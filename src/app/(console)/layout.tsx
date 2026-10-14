import { ConsoleShell } from "@/components/console-shell";

/** 控制台布局（侧栏变体由 ConsoleShell 按路径判断） */
export default function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ConsoleShell>{children}</ConsoleShell>;
}
