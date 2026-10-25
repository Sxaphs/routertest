/**
 * Stripe 实现（stub）。
 *
 * TODO(backend): 真实集成步骤——
 * 1. 安装 @stripe/stripe-js + @stripe/react-stripe-js（当前约束不加依赖，先占位）；
 * 2. createIntent → POST /v1/billing/topup（法币）或 /v1/billing/topup/crypto（USDC），
 *    响应 { intentId, clientSecret, amount, currency }；
 * 3. payment-sheet.tsx 的占位收银区替换为 <Elements options={{ clientSecret }}>
 *    + <PaymentElement />；crypto 通道由 Stripe 托管收银流程完成钱包签名
 *    （前端不再构造 eth_sendTransaction）；
 * 4. pollIntent → GET /v1/billing/topup/crypto/{intentId}（或法币对应端点），
 *    状态 confirming → credited / failed；正式入账以 webhook 为准，轮询只做 UI 确认；
 * 5. listPaymentMethods/add/delete → GET/POST/DELETE /v1/billing/payment-methods。
 *
 * 换支付商（Coinbase Business / NOWPayments）时新建同类实现并在 index.ts 切换。
 */
import type {
  IntentStatus,
  PaymentProvider,
  SavedPaymentMethod,
  TopupIntent,
} from "./index";

export class StripePaymentProvider implements PaymentProvider {
  createIntent(): Promise<TopupIntent> {
    throw new Error("StripePaymentProvider not wired yet (TODO(backend))");
  }
  pollIntent(): Promise<IntentStatus> {
    throw new Error("StripePaymentProvider not wired yet (TODO(backend))");
  }
  listPaymentMethods(): Promise<SavedPaymentMethod[]> {
    throw new Error("StripePaymentProvider not wired yet (TODO(backend))");
  }
  addPaymentMethod(): Promise<SavedPaymentMethod> {
    throw new Error("StripePaymentProvider not wired yet (TODO(backend))");
  }
  deletePaymentMethod(): Promise<void> {
    throw new Error("StripePaymentProvider not wired yet (TODO(backend))");
  }
}
