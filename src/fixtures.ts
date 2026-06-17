export type PlatformId = "lemonsqueezy" | "stripe" | "paddle" | "polar";

export type EventId =
  | "order_created"
  | "subscription_created"
  | "subscription_payment_success"
  | "subscription_cancelled"
  | "license_key_created";

export type FrameworkId = "next" | "hono" | "express";

export type OutputTab = "payload" | "signature" | "curl" | "handler" | "test";

export type EventDefinition = {
  id: EventId;
  name: string;
  description: string;
  group: "Orders" | "Subscriptions" | "Licenses";
};

export const platforms: Array<{
  id: PlatformId;
  name: string;
  status: "free" | "pro";
}> = [
  { id: "lemonsqueezy", name: "Lemon Squeezy", status: "free" },
  { id: "stripe", name: "Stripe", status: "pro" },
  { id: "paddle", name: "Paddle", status: "pro" },
  { id: "polar", name: "Polar", status: "pro" }
];

export const lemonEvents: EventDefinition[] = [
  {
    id: "order_created",
    name: "order_created",
    description: "One-time purchase completed",
    group: "Orders"
  },
  {
    id: "subscription_created",
    name: "subscription_created",
    description: "New recurring subscription",
    group: "Subscriptions"
  },
  {
    id: "subscription_payment_success",
    name: "subscription_payment_success",
    description: "Renewal payment succeeded",
    group: "Subscriptions"
  },
  {
    id: "subscription_cancelled",
    name: "subscription_cancelled",
    description: "Customer cancelled access",
    group: "Subscriptions"
  },
  {
    id: "license_key_created",
    name: "license_key_created",
    description: "License issued after checkout",
    group: "Licenses"
  }
];

const now = "2026-06-17T02:30:00.000000Z";

export function buildLemonPayload(event: EventId): Record<string, unknown> {
  const baseMeta = {
    event_name: event,
    custom_data: {
      account_id: "acct_demo_42",
      plan: event.includes("subscription") ? "starter" : "pro-kit"
    }
  };

  if (event === "order_created") {
    return {
      meta: baseMeta,
      data: {
        type: "orders",
        id: "3182231",
        attributes: {
          store_id: 88421,
          customer_id: 1928821,
          identifier: "3182231",
          order_number: 1042,
          user_name: "Ada Lovelace",
          user_email: "ada@example.com",
          currency: "CNY",
          currency_rate: "0.14800000",
          subtotal: 13900,
          discount_total: 0,
          tax: 0,
          total: 13900,
          subtotal_usd: 2057,
          discount_total_usd: 0,
          tax_usd: 0,
          total_usd: 2057,
          status: "paid",
          status_formatted: "Paid",
          refunded: false,
          refunded_at: null,
          created_at: now,
          updated_at: now,
          test_mode: false
        }
      }
    };
  }

  if (event === "subscription_created") {
    return {
      meta: baseMeta,
      data: {
        type: "subscriptions",
        id: "781219",
        attributes: {
          store_id: 88421,
          customer_id: 1928821,
          order_id: 3182231,
          order_item_id: 3021211,
          product_id: 202601,
          variant_id: 302602,
          product_name: "BillingWebhookKit Pro",
          variant_name: "Starter",
          user_name: "Ada Lovelace",
          user_email: "ada@example.com",
          status: "active",
          status_formatted: "Active",
          card_brand: "visa",
          card_last_four: "4242",
          renews_at: "2026-07-17T02:30:00.000000Z",
          ends_at: null,
          trial_ends_at: null,
          cancelled: false,
          test_mode: false,
          created_at: now,
          updated_at: now
        }
      }
    };
  }

  if (event === "subscription_payment_success") {
    return {
      meta: baseMeta,
      data: {
        type: "subscription-invoices",
        id: "9823001",
        attributes: {
          store_id: 88421,
          subscription_id: 781219,
          customer_id: 1928821,
          user_name: "Ada Lovelace",
          user_email: "ada@example.com",
          billing_reason: "renewal",
          card_brand: "visa",
          card_last_four: "4242",
          currency: "CNY",
          subtotal: 13900,
          discount_total: 0,
          tax: 0,
          total: 13900,
          subtotal_usd: 2057,
          discount_total_usd: 0,
          tax_usd: 0,
          total_usd: 2057,
          status: "paid",
          status_formatted: "Paid",
          refunded: false,
          refunded_at: null,
          test_mode: false,
          created_at: now,
          updated_at: now
        }
      }
    };
  }

  if (event === "subscription_cancelled") {
    return {
      meta: baseMeta,
      data: {
        type: "subscriptions",
        id: "781219",
        attributes: {
          store_id: 88421,
          customer_id: 1928821,
          order_id: 3182231,
          product_id: 202601,
          variant_id: 302602,
          product_name: "BillingWebhookKit Pro",
          user_name: "Ada Lovelace",
          user_email: "ada@example.com",
          status: "cancelled",
          status_formatted: "Cancelled",
          renews_at: null,
          ends_at: "2026-06-30T02:30:00.000000Z",
          cancelled: true,
          test_mode: false,
          created_at: now,
          updated_at: now
        }
      }
    };
  }

  return {
    meta: baseMeta,
    data: {
      type: "license-keys",
      id: "551921",
      attributes: {
        store_id: 88421,
        customer_id: 1928821,
        order_id: 3182231,
        order_item_id: 3021211,
        product_id: 202601,
        user_name: "Ada Lovelace",
        user_email: "ada@example.com",
        key: "BWHK-LIVE-DEMO-1234",
        key_short: "BWHK-...-1234",
        activation_limit: 3,
        instances_count: 0,
        disabled: false,
        status: "inactive",
        status_formatted: "Inactive",
        expires_at: null,
        test_mode: false,
        created_at: now,
        updated_at: now
      }
    }
  };
}
