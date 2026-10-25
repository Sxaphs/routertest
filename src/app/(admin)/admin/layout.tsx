import { AdminShell } from "@/components/admin-shell";

/** 运营后台布局（独立 AdminShell，RBAC 门在壳内） */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
