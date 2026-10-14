import Link from "next/link";
import { brand } from "@/config/brand";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { SearchPalette } from "@/components/search-palette";
import { DistributionNavLink, RoleSwitcher } from "@/components/role-switcher";

/** 顶部导航（sticky）。结构对齐参照站：logo / 搜索按钮 / 一级导航 / Sign Up / 主题切换 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur">
      <div
        className="mx-auto flex items-center gap-4 px-4 lg:px-6"
        style={{ height: "var(--navbar-height)" }}
      >
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <span
            aria-hidden
            className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm"
          >
            {brand.logoMark}
          </span>
          <span className="lowercase">{brand.name}</span>
        </Link>

        {/* ⌘K 全局搜索面板 */}
        <SearchPalette />

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {brand.nav.map((item) => (
            <Button key={item.href} variant="ghost" asChild>
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
          <DistributionNavLink />
        </nav>

        <RoleSwitcher />
        <Button asChild className="ml-2">
          <Link href="/sign-up">Sign Up</Link>
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
}
