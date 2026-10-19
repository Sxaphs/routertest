"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ConnectedChip,
  WalletPicker,
  useWalletConnection,
} from "@/components/wallet-connect";
import { getProvider } from "@/lib/wallets";

/**
 * Crypto 充值面板（credits 页 Use crypto 开启时渲染）。
 * 真实链路 TODO(backend)：前端发起链上转账 → 后端监听确认 → 入账；
 * 当前为 mock：连接真实注入钱包（或 ?mockwallet 测试钱包），支付只出 mock tx。
 */
export function CryptoTopup({
  onPaid,
}: {
  onPaid?: (amountUsd: string, txHash: string) => void;
}) {
  const { conn, connecting, error, connect, disconnect } = useWalletConnection();
  const [amount, setAmount] = useState("50");
  const [token, setToken] = useState("USDC");
  const [chain, setChain] = useState("ethereum");
  const [paying, setPaying] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const pay = async () => {
    if (!conn) return;
    setPaying(true);
    // TODO(backend): 真实流程 = 构造链上转账（ethers/viem）→ 用户签名 → 后端验收入账
    const hash = (await getProvider(conn.walletId)!.request({
      method: "eth_sendTransaction",
      params: [{ to: "0xOURBRAND_DEPOSIT", value: "0x0", data: `topup:${amount} ${token}` }],
    })) as string;
    setTxHash(hash);
    setPaying(false);
    onPaid?.(amount, hash);
  };

  if (txHash) {
    return (
      <div className="mt-4 rounded-lg border p-4">
        <div className="rounded-md bg-emerald-500/10 p-3 text-sm">
          <p className="flex items-center gap-2 font-medium text-emerald-600 dark:text-emerald-400">
            <Check className="size-4" /> Payment submitted
          </p>
          <p className="mt-1 break-all font-mono text-xs text-muted-foreground">
            {txHash}
          </p>
        </div>
      </div>
    );
  }

  if (!conn) {
    return (
      <div className="mt-4 rounded-lg border p-4">
        <WalletPicker connecting={connecting} error={error} onConnect={connect} />
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3 rounded-lg border p-4">
      <ConnectedChip conn={conn} onDisconnect={disconnect} />
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-xs text-muted-foreground" htmlFor="crypto-amount">
            Amount (USD)
          </label>
          <Input
            id="crypto-amount"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Token</label>
          <Select value={token} onValueChange={setToken}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="USDC">USDC</SelectItem>
              <SelectItem value="USDT">USDT</SelectItem>
              <SelectItem value="ETH">ETH</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Network</label>
          <Select value={chain} onValueChange={setChain}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ethereum">Ethereum</SelectItem>
              <SelectItem value="polygon">Polygon</SelectItem>
              <SelectItem value="bsc">BNB Chain</SelectItem>
              <SelectItem value="solana">Solana</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button className="w-full" disabled={paying || !Number(amount)} onClick={pay}>
        {paying ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Confirm in wallet…
          </>
        ) : (
          <>Pay ${amount || "0"} {token}</>
        )}
      </Button>
      <p className="text-xs text-muted-foreground">
        Credits land automatically after on-chain confirmation (mock tx for now, TODO(backend)).
      </p>
    </div>
  );
}
