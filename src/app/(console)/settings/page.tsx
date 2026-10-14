import { redirect } from "next/navigation";

/** 与参照站一致：/settings → /settings/preferences */
export default function SettingsIndexPage() {
  redirect("/settings/preferences");
}
