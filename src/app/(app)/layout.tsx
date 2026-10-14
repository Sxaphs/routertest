import { SiteHeader } from "@/components/site-header";
import { PromoBanner } from "@/components/promo-banner";

/** 应用型页面（/chat）：有顶栏与公告条，无页脚，主体高度锁定一屏 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <SiteHeader />
      <PromoBanner />
      <main id="skip" className="min-h-0 flex-1">
        {children}
      </main>
    </div>
  );
}
