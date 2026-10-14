import { redirect } from "next/navigation";

/** 兼容原站 URL 形态：/workspaces/default/keys → /settings/keys（我方规范路径） */
export default function WorkspaceKeysPage() {
  redirect("/settings/keys");
}
