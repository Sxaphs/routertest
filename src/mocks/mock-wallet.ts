/**
 * 测试用注入钱包：在 ?mockwallet 存在时向 window 注入假的 EIP-1193 provider，
 * 让无插件环境（CI、REA 场景）也能完整走通 连接→签名→支付 流程。
 * 只在客户端、仅在查询参数存在时生效，不进生产逻辑。
 */
import type { Eip1193Provider } from "@/lib/wallets";

export const MOCK_WALLET_ADDRESS = "0xA11CE5Ee8f5B9a7E3b0cF2D4a6B8c0E1f3A5B7C9";

export function installMockWallet(): void {
  if (typeof window === "undefined") return;
  if (!window.location.search.includes("mockwallet")) return;
  if (window.ethereum?.isMetaMask) return; // 已注入过

  const provider: Eip1193Provider = {
    isMetaMask: true,
    request: async ({ method }) => {
      await new Promise((r) => setTimeout(r, 400)); // 模拟用户确认延迟
      switch (method) {
        case "eth_requestAccounts":
        case "eth_accounts":
          return [MOCK_WALLET_ADDRESS];
        case "eth_chainId":
          return "0x1";
        case "eth_sendTransaction":
          return "0x" + "ab".repeat(32); // mock tx hash
        case "personal_sign":
          return "0x" + "cd".repeat(65);
        default:
          throw new Error(`mock wallet: unsupported method ${method}`);
      }
    },
  };
  window.ethereum = provider;
}
