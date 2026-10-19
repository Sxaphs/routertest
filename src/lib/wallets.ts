/**
 * 浏览器注入式钱包（EIP-1193）检测与连接层。
 * 生产环境建议替换为 Reown AppKit（WalletConnect，支持移动端/硬件钱包），
 * 本层接口保持兼容，可整体换成 AppKit 的 useAppKitAccount。
 */

export interface WalletDef {
  id: string;
  name: string;
  /** 官网/下载页（未安装时引导） */
  url: string;
}

export const SUPPORTED_WALLETS: WalletDef[] = [
  { id: "metamask", name: "MetaMask", url: "https://metamask.io/download/" },
  { id: "okx", name: "OKX Wallet", url: "https://www.okx.com/web3" },
  { id: "phantom", name: "Phantom", url: "https://phantom.com/" },
  { id: "backpack", name: "Backpack", url: "https://backpack.app/" },
  { id: "binance", name: "Binance Wallet", url: "https://www.binance.com/en/web3wallet" },
];

/** EIP-1193 Provider 的最小形态 */
export interface Eip1193Provider {
  request: (args: { method: string; params?: unknown[] | object }) => Promise<unknown>;
  isMetaMask?: boolean;
  isBackpack?: boolean;
  isBinance?: boolean;
  isOkxWallet?: boolean;
}

declare global {
  interface Window {
    ethereum?: Eip1193Provider & { providers?: Eip1193Provider[] };
    okxwallet?: Eip1193Provider;
    phantom?: { ethereum?: Eip1193Provider };
    backpack?: { ethereum?: Eip1193Provider } | Eip1193Provider;
    binancew3?: Eip1193Provider;
  }
}

/** 在（可能共存的）注入环境里挑出指定钱包的 provider */
export function getProvider(id: string): Eip1193Provider | null {
  if (typeof window === "undefined") return null;
  const eth = window.ethereum;
  const fromList = (pred: (p: Eip1193Provider) => boolean) =>
    eth?.providers?.find(pred) ?? (eth && pred(eth) ? eth : null);

  switch (id) {
    case "metamask":
      return fromList((p) => !!p.isMetaMask);
    case "okx":
      return window.okxwallet ?? fromList((p) => !!p.isOkxWallet);
    case "phantom":
      return window.phantom?.ethereum ?? null;
    case "backpack": {
      const bp = window.backpack;
      if (bp && "ethereum" in bp && bp.ethereum) return bp.ethereum;
      if (bp && "request" in bp) return bp;
      return fromList((p) => !!p.isBackpack);
    }
    case "binance":
      return window.binancew3 ?? fromList((p) => !!p.isBinance);
    default:
      return null;
  }
}

export function isInstalled(id: string): boolean {
  return getProvider(id) !== null;
}

/** 连接钱包，返回首个账户地址（EIP-1193 eth_requestAccounts） */
export async function connectWallet(id: string): Promise<string> {
  const provider = getProvider(id);
  if (!provider) throw new Error(`${id} wallet not installed`);
  const accounts = (await provider.request({
    method: "eth_requestAccounts",
  })) as string[];
  if (!accounts?.length) throw new Error("No account authorized");
  return accounts[0];
}

export function shortAddress(addr: string): string {
  return addr.length > 10 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr;
}
