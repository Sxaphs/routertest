import Link from "next/link";
import { brand } from "@/config/brand";

/** 页脚：品牌列 + 4 列链接组（Product / Company / Developer / Connect） */
export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-12 md:grid-cols-5 lg:px-6">
        <div className="col-span-2 md:col-span-1">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <span
              aria-hidden
              className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm"
            >
              {brand.logoMark}
            </span>
            <span className="lowercase">{brand.name}</span>
          </Link>
          <p className="mt-3 text-sm text-muted-foreground">
            © 2026 {brand.legalName}
          </p>
        </div>
        {brand.footer.columns.map((col) => (
          <div key={col.title}>
            <h3 className="text-sm font-semibold">{col.title}</h3>
            <ul className="mt-3 space-y-2">
              {col.links.map((l) => (
                <li key={l.text}>
                  <Link
                    href={l.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {l.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}
