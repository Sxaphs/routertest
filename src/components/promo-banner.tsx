"use client";

import { useState } from "react";
import Link from "next/link";
import { X, Sparkles } from "lucide-react";
import { brand } from "@/config/brand";

/** 顶部公告条（可关闭）。文案来自 brand.ts，上线前替换为真实公告。 */
export function PromoBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed || !brand.banner.text) return null;
  return (
    <div className="sticky top-[var(--navbar-height)] z-40 border-b bg-secondary/60">
      <div className="mx-auto flex items-center justify-center gap-2 px-4 py-2 text-sm">
        <Sparkles className="size-4 text-primary" />
        <span>
          {brand.banner.text}{" "}
          <Link
            href={brand.banner.linkHref}
            className="text-primary underline-offset-4 hover:underline"
          >
            {brand.banner.linkText}
          </Link>
        </span>
        <button
          aria-label="Dismiss"
          onClick={() => setDismissed(true)}
          className="absolute right-3 text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
