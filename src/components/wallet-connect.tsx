"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Loader2, Wallet, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  SUPPORTED_WALLETS,
  connectWallet,
  getProvider,
  shortAddress,
} from "@/lib/wallets";
import { installMockWallet } from "@/mocks/mock-wallet";

/**
 * 钱包连接共用组件（Crypto 充值/提现共用）。
 * 连接逻辑 hook + 选择面板 + 已连接徽章。
 */

export interface WalletConn {
  walletId: string;
  address: string;
}

export function useWalletConnection() {
  const [conn, setConn] = useState<WalletConn | null>(null);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [error, setError] = useState("");

  // 测试钱包注入（?mockwallet），无插件环境下演示用；注入后需重渲染以刷新 Installed 检测
  const [, forceRefresh] = useState(0);
  useEffect(() => {
    installMockWallet();
    forceRefresh((n) => n + 1);
  }, []);

  const connect = async (id: string) => {
    setError("");
    setConnecting(id);
    try {
      const address = await connectWallet(id);
      setConn({ walletId: id, address });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Connection rejected");
    } finally {
      setConnecting(null);
    }
  };

  return {
    conn,
    connecting,
    error,
    connect,
    disconnect: () => setConn(null),
  };
}

/** 5 款注入式钱包的选择面板 */
export function WalletPicker({
  connecting,
  error,
  onConnect,
}: {
  connecting: string | null;
  error: string;
  onConnect: (id: string) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Connect a wallet</p>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="grid gap-2">
        {SUPPORTED_WALLETS.map((w) => {
          const installed = !!getProvider(w.id);
          const busy = connecting === w.id;
          return (
            <div key={w.id} className="flex items-center gap-2">
              <Button
                variant="outline"
                className="flex-1 justify-start"
                disabled={!installed || connecting !== null}
                onClick={() => onConnect(w.id)}
              >
                <span className="flex size-5 items-center justify-center rounded-full border text-[10px] font-bold">
                  {w.name[0]}
                </span>
                {w.name}
                {busy && <Loader2 className="ml-auto size-4 animate-spin" />}
                {!busy && (
                  <Badge
                    variant="secondary"
                    className={
                      installed
                        ? "ml-auto bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : "ml-auto"
                    }
                  >
                    {installed ? "Installed" : "Not installed"}
                  </Badge>
                )}
              </Button>
              {!installed && (
                <Button variant="ghost" size="icon" asChild aria-label={`Install ${w.name}`}>
                  <a href={w.url} target="_blank" rel="noreferrer">
                    <ExternalLink className="size-4" />
                  </a>
                </Button>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        Browser-extension (injected) wallets. Mobile / WalletConnect support via Reown AppKit (TODO(backend)).
        No extension? Append <code>?mockwallet</code> to the URL for a test wallet.
      </p>
    </div>
  );
}

/** 已连接钱包徽章（名称 + 缩略地址 + 断开） */
export function ConnectedChip({
  conn,
  onDisconnect,
}: {
  conn: WalletConn;
  onDisconnect: () => void;
}) {
  const name = SUPPORTED_WALLETS.find((w) => w.id === conn.walletId)?.name ?? "Wallet";
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="flex items-center gap-2">
        <Wallet className="size-4 text-primary" />
        {name}
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
          {shortAddress(conn.address)}
        </code>
      </span>
      <button
        className="text-xs text-muted-foreground hover:text-foreground"
        onClick={onDisconnect}
      >
        <X className="inline size-3" /> Disconnect
      </button>
    </div>
  );
}
