/**
 * Mock 支付实现：数据与状态机都在 src/mocks/billing.ts，
 * 这里只做接口形状的适配（与真实 Stripe 实现同构）。
 */
import type {
  IntentStatus,
  PaymentProvider,
  PaymentRail,
  SavedPaymentMethod,
  TopupIntent,
} from "./index";
import {
  addMockPaymentMethod,
  createTopupIntent,
  deleteMockPaymentMethod,
  listMockPaymentMethods,
  pollTopupIntent,
} from "@/mocks/billing";

export class MockPaymentProvider implements PaymentProvider {
  createIntent(input: { amountUsd: string; rail: PaymentRail }): Promise<TopupIntent> {
    return createTopupIntent(input);
  }
  pollIntent(intentId: string): Promise<IntentStatus> {
    return pollTopupIntent(intentId);
  }
  listPaymentMethods(): Promise<SavedPaymentMethod[]> {
    return listMockPaymentMethods();
  }
  addPaymentMethod(): Promise<SavedPaymentMethod> {
    return addMockPaymentMethod();
  }
  deletePaymentMethod(id: string): Promise<void> {
    return deleteMockPaymentMethod(id);
  }
}
