import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PromoBanner } from "@/components/promo-banner";
import { FuseBanner } from "@/components/fuse-banner";

/** 公开站外立面：顶部导航 + 公告条 + 熔断横幅 + 页脚 */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <PromoBanner />
      <FuseBanner />
      <main id="skip" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
