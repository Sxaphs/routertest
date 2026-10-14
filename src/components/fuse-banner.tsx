"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Flame, X } from "lucide-react";
import { FUSE_STORAGE } from "@/mocks/protection";

interface FuseState {
  reason: string;
  keyName: string;
  time: string;
}

/**
 * 全局熔断告警横幅：localStorage 存在生效熔断时显示；
 * dismiss 状态存 localStorage（同一次熔断 dismiss 后不再出现，新熔断重新出现）。
 * TODO(backend): 熔断状态改由服务端推送/轮询。
 */
export function FuseBanner() {
  const [fuse, setFuse] = useState<FuseState | null>(null);

  useEffect(() => {
    const read = () => {
      const raw = localStorage.getItem(FUSE_STORAGE.triggered);
      const dismissed = localStorage.getItem(FUSE_STORAGE.dismissed);
      if (!raw || dismissed === raw) {
        setFuse(null);
        return;
      }
      try {
        setFuse(JSON.parse(raw) as FuseState);
      } catch {
        setFuse(null);
      }
    };
    read();
    window.addEventListener("fuse-state-changed", read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener("fuse-state-changed", read);
      window.removeEventListener("storage", read);
    };
  }, []);

  if (!fuse) return null;

  return (
    <div
      role="alert"
      className="sticky top-[var(--navbar-height)] z-40 border-b bg-destructive/10"
    >
      <div className="mx-auto flex items-center justify-center gap-2 px-4 py-2 text-sm">
        <Flame className="size-4 text-destructive" />
        <span>
          <b>Fuse triggered:</b>
          {fuse.reason}(key: {fuse.keyName}). API calls are paused.{" "}
          <Link
            href="/settings/protection"
            className="font-medium text-destructive underline underline-offset-4"
          >
            Go to Spend Protection
          </Link>
        </span>
        <button
          aria-label="Dismiss"
          className="absolute right-3 text-muted-foreground hover:text-foreground"
          onClick={() => {
            localStorage.setItem(
              FUSE_STORAGE.dismissed,
              localStorage.getItem(FUSE_STORAGE.triggered) ?? "",
            );
            setFuse(null);
          }}
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
