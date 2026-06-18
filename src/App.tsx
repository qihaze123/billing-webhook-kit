import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Calculator,
  Check,
  CheckCircle2,
  Clipboard,
  Code2,
  Download,
  ExternalLink,
  FileJson,
  Fingerprint,
  KeyRound,
  ListChecks,
  PackageCheck,
  Play,
  Repeat2,
  ShieldCheck,
  Terminal,
  XCircle
} from "lucide-react";
import {
  buildLemonPayload,
  lemonEvents,
  platforms,
  type EventId,
  type FrameworkId,
  type OutputTab
} from "./fixtures";
import { asJson, curlCommand, downloadText, handlerTemplate, hmacSha256Hex, testTemplate } from "./generators";

const frameworks: Array<{ id: FrameworkId; label: string }> = [
  { id: "next", label: "Next.js" },
  { id: "hono", label: "Hono" },
  { id: "express", label: "Express" }
];

const tabs: Array<{ id: OutputTab; label: string; icon: typeof FileJson }> = [
  { id: "payload", label: "Payload", icon: FileJson },
  { id: "signature", label: "Signature", icon: KeyRound },
  { id: "curl", label: "cURL", icon: Terminal },
  { id: "handler", label: "Handler", icon: Code2 },
  { id: "test", label: "Test", icon: Play }
];

const guideLinks = [
  { href: "troubleshooting.html", label: "Lemon Squeezy webhook troubleshooting hub" },
  { href: "guides/lemon-squeezy-webhook-test.html", label: "Test Lemon Squeezy webhooks locally" },
  { href: "guides/lemon-squeezy-webhook-signature.html", label: "Verify Lemon Squeezy signatures" },
  { href: "guides/lemon-squeezy-webhook-test-checklist.html", label: "Lemon Squeezy webhook test checklist" },
  { href: "guides/lemon-squeezy-webhook-raw-body-nextjs.html", label: "Next.js raw body signature checks" },
  { href: "tools/nextjs-lemon-squeezy-raw-body-audit.html", label: "Next.js Lemon Squeezy raw body audit" },
  { href: "tools/vercel-lemon-squeezy-webhook-debugger.html", label: "Vercel Lemon Squeezy webhook debugger" },
  { href: "guides/nextjs-webhook-405-lemon-squeezy.html", label: "Fix Next.js 405 Lemon Squeezy webhooks" },
  { href: "guides/lemon-squeezy-x-signature-invalid.html", label: "Fix invalid x-signature errors" },
  { href: "guides/lemon-squeezy-order-created-fixture.html", label: "order_created webhook fixture" },
  { href: "guides/lemon-squeezy-checkout-smoke-test.html", label: "Lemon Squeezy checkout smoke test" },
  { href: "guides/lemon-squeezy-checkout-404-custom-price-currency.html", label: "Fix checkout 404 and currency mismatch" },
  { href: "guides/lemon-squeezy-paypal-checkout-webhook-test.html", label: "PayPal checkout webhook test" },
  { href: "guides/lemon-squeezy-production-checkout-go-live.html", label: "Production checkout go-live checklist" },
  { href: "guides/lemon-squeezy-production-webhook-troubleshooting.html", label: "Production webhook troubleshooting" },
  { href: "guides/webhook-signature-mismatch-debugger.html", label: "Webhook signature mismatch debugger" },
  { href: "guides/lemon-squeezy-webhook-idempotency.html", label: "Lemon Squeezy idempotency" },
  { href: "guides/webhook-idempotency-key-generator.html", label: "Webhook idempotency key generator" },
  { href: "guides/nextjs-lemon-squeezy-webhook-handler.html", label: "Next.js Lemon Squeezy handler" },
  { href: "guides/hono-lemon-squeezy-webhook-handler.html", label: "Hono Lemon Squeezy handler" },
  { href: "guides/stripe-webhook-fixture-generator.html", label: "Stripe webhook fixtures" },
  { href: "guides/paddle-webhook-test-payload.html", label: "Paddle webhook payloads" },
  { href: "guides/webhook-replay-curl-command.html", label: "Replay webhooks with cURL" },
  { href: "guides/payment-webhook-ci-tests.html", label: "Payment webhook CI tests" },
  { href: "guides/payment-webhook-contract-test-generator.html", label: "Payment webhook contract test generator" },
  { href: "guides/billing-webhook-launch-readiness-checklist.html", label: "Billing webhook launch readiness" },
  { href: "guides/billing-webhook-cost-calculator.html", label: "Billing webhook cost calculator" },
  { href: "guides/ai-saas-billing-webhook-checklist.html", label: "AI SaaS billing webhook checklist" },
  { href: "guides/lemon-squeezy-vs-stripe-webhooks-ai-saas.html", label: "Lemon Squeezy vs Stripe webhooks" },
  { href: "guides/billing-webhook-kit-pricing-roi.html", label: "BillingWebhookKit pricing ROI" },
  { href: "guides/billing-webhook-kit-buyer-checklist.html", label: "BillingWebhookKit buyer checklist" },
  { href: "billing-webhook-kit-pro-sample-report.html", label: "BillingWebhookKit Pro sample report" },
  { href: "tools/billing-webhook-pro-fit-checker.html", label: "BillingWebhookKit Pro fit checker" },
  { href: "guides/lemon-squeezy-license-key-webhook.html", label: "License key webhook tests" },
  { href: "guides/subscription-payment-success-webhook.html", label: "Subscription payment success" },
  { href: "guides/polar-webhook-fixtures.html", label: "Polar webhook fixtures" },
  { href: "guides/webhook-idempotency-checklist.html", label: "Webhook idempotency checklist" },
  { href: "guides/webhook-duplicate-replay-test.html", label: "Webhook duplicate replay test" },
  { href: "guides/webhook-review-checklist.html", label: "Webhook review checklist" },
  { href: "guides/webhook-entitlement-decision-matrix.html", label: "Webhook entitlement decision matrix" },
  { href: "guides/cloudflare-worker-webhook-handler.html", label: "Cloudflare Worker handler" },
  { href: "guides/saas-billing-webhook-test-plan.html", label: "SaaS billing webhook test plan" },
  { href: "guides/lemon-squeezy-webhook-fixtures.html", label: "Lemon Squeezy webhook fixtures" },
  { href: "guides/payment-webhook-test-generator.html", label: "Payment webhook test generator" },
  { href: "guides/billing-webhook-starter-kit.html", label: "Billing webhook starter kit" },
  { href: "guides/nextjs-billing-webhook-test-suite.html", label: "Next.js billing webhook tests" },
  { href: "guides/saas-webhook-release-checklist.html", label: "SaaS webhook release checklist" }
];

const proArtifacts = [
  "fixtures/lemon/order_created.json",
  "src/idempotency.ts",
  "src/handlers/next-app-router.ts",
  "src/handlers/cloudflare-worker.ts",
  "tests/lemon-signature.test.ts",
  "tests/lemon-contract.test.ts",
  "tests/lemon-idempotency-replay.test.ts",
  "docs/idempotency-runbook.md",
  "docs/contract-tests.md",
  "docs/webhook-review-report-template.md",
  ".github/workflows/webhook-checks.yml"
];

const integrationSignals = [
  "Raw-body HMAC checks",
  "Signature mismatch debugger",
  "Idempotent retry fixtures",
  "Duplicate replay simulator",
  "Provider mapping examples"
];

const defaultEndpoint = "https://yourapp.com/api/webhooks/lemonsqueezy";
const productUrl = "https://qihaze123.github.io/billing-webhook-kit/";

const signatureSymptoms = [
  {
    id: "raw_body_changed",
    label: "Raw body changed before HMAC",
    signal: "The computed digest is stable locally, but the provider dashboard still reports a signature mismatch."
  },
  {
    id: "wrong_secret",
    label: "Wrong signing secret",
    signal: "The handler uses a checkout API key, product key, or old webhook secret instead of the endpoint signing secret."
  },
  {
    id: "header_format",
    label: "Header format mismatch",
    signal: "The received header includes sha256=, uppercase hex, whitespace, or the wrong provider signature header."
  },
  {
    id: "framework_parser",
    label: "Framework body parser issue",
    signal: "The route works for test JSON but fails for real provider deliveries after middleware or request parsing."
  },
  {
    id: "local_replay",
    label: "cURL replay mismatch",
    signal: "A copied payload fails when replayed from terminal or CI, even with the expected secret."
  }
] as const;

const readinessItems = [
  {
    id: "raw_signature_test",
    area: "Signature gate",
    label: "Raw-body signature test passes",
    weight: 18,
    evidence: "A fixture test verifies the exact raw request body before JSON parsing.",
    risk: "Provider deliveries can fail or forged requests can reach billing logic."
  },
  {
    id: "duplicate_replay",
    area: "Retry safety",
    label: "Duplicate replay only runs side effects once",
    weight: 16,
    evidence: "A replay test sends the same event at least three times and expects one side effect.",
    risk: "Retries can send duplicate emails, licenses, invoices, or entitlement writes."
  },
  {
    id: "entitlement_matrix",
    area: "Access policy",
    label: "Event-to-entitlement matrix is reviewed",
    weight: 15,
    evidence: "Paid orders, renewals, cancellations, failed payments, and unknown events have explicit decisions.",
    risk: "Paid users may be blocked, unpaid users may get access, or cancellations may revoke too early."
  },
  {
    id: "fixture_library",
    area: "Provider coverage",
    label: "Happy and failure fixtures exist",
    weight: 13,
    evidence: "The route has fixtures for order, subscription, payment success, cancellation, license, and malformed events.",
    risk: "The integration only works for the one webhook shape tested manually."
  },
  {
    id: "secret_environments",
    area: "Deployment config",
    label: "Staging and production secrets are separated",
    weight: 12,
    evidence: "Webhook signing secrets, API keys, store IDs, and variant IDs are stored per environment.",
    risk: "Production can silently verify against a stale or staging webhook secret."
  },
  {
    id: "checkout_smoke",
    area: "Revenue path",
    label: "Checkout-to-webhook smoke test is complete",
    weight: 11,
    evidence: "A real checkout event reaches the deployed webhook endpoint and creates the expected billing record.",
    risk: "The public purchase path may work while fulfillment or access delivery fails."
  },
  {
    id: "review_report",
    area: "Release review",
    label: "Webhook review report is attached to the PR",
    weight: 8,
    evidence: "The route PR includes signature gate, idempotency key, trusted fields, decision, and retry checks.",
    risk: "Future edits can weaken billing safety without a release artifact to compare against."
  },
  {
    id: "monitoring_plan",
    area: "Operations",
    label: "Failure monitoring and replay plan exists",
    weight: 7,
    evidence: "Rejected signatures, unknown events, duplicate deliveries, and failed side effects are observable.",
    risk: "Billing errors will be found by customers instead of logs, alerts, or replayable event samples."
  }
] as const;

const idempotencyProviders = [
  { id: "lemonsqueezy", label: "Lemon Squeezy", defaultEvent: "order_created", defaultObject: "order_1042" },
  { id: "stripe", label: "Stripe", defaultEvent: "checkout.session.completed", defaultObject: "cs_test_1042" },
  { id: "paddle", label: "Paddle", defaultEvent: "transaction.completed", defaultObject: "txn_1042" },
  { id: "polar", label: "Polar", defaultEvent: "order.paid", defaultObject: "ord_1042" }
] as const;

const idempotencyScopes = [
  { id: "event", label: "Event object", note: "Use when each provider event object should run once." },
  { id: "invoice", label: "Invoice/payment", note: "Use when renewal payment side effects should run once per invoice." },
  { id: "entitlement", label: "Entitlement target", note: "Use when access writes should be unique per customer or subscription." }
] as const;

const entitlementRows = [
  {
    event: "order_created",
    state: "paid",
    decision: "Grant one-time access",
    writeModel: "purchase entitlement + processed event",
    customerMessage: "Send receipt and download/license instructions once.",
    testCase: "Paid order grants exactly once under duplicate replay."
  },
  {
    event: "order_created",
    state: "pending, failed, refunded",
    decision: "Hold or revoke access",
    writeModel: "order audit record, no active entitlement",
    customerMessage: "Do not promise access until payment state is final.",
    testCase: "Unpaid or refunded order does not grant access."
  },
  {
    event: "license_key_created",
    state: "created",
    decision: "Deliver license key",
    writeModel: "license entitlement with redacted key reference",
    customerMessage: "Email or display the license once; avoid logging full keys.",
    testCase: "License delivery is idempotent and masks the key in logs."
  },
  {
    event: "subscription_created",
    state: "active or trialing",
    decision: "Activate subscription",
    writeModel: "subscription entitlement + current period",
    customerMessage: "Confirm access is active for the plan period.",
    testCase: "Subscription create maps customer to the correct plan."
  },
  {
    event: "subscription_payment_success",
    state: "paid",
    decision: "Extend renewal",
    writeModel: "invoice payment + renewed entitlement window",
    customerMessage: "Send renewal receipt once if the product needs it.",
    testCase: "Retrying the same invoice does not extend twice."
  },
  {
    event: "subscription_cancelled",
    state: "ends_at present",
    decision: "Schedule cancellation",
    writeModel: "subscription status + scheduled access end",
    customerMessage: "Tell the user when access ends, not just that it ended.",
    testCase: "Cancellation keeps access until the configured end date."
  },
  {
    event: "payment_failed",
    state: "past_due or failed",
    decision: "Pause risky side effects",
    writeModel: "dunning state, no destructive delete",
    customerMessage: "Ask for payment update without deleting data immediately.",
    testCase: "Failed payment does not erase entitlement history."
  },
  {
    event: "unknown_event",
    state: "unmapped",
    decision: "Quarantine and acknowledge",
    writeModel: "raw event sample + alert",
    customerMessage: "No customer-facing message until the event is classified.",
    testCase: "Unknown events are stored for review and do not run side effects."
  }
];

type CheckoutConfig = {
  checkoutUrl?: string;
};

type VerificationState =
  | { status: "empty"; message: string }
  | { status: "invalid"; message: string }
  | { status: "match"; message: string }
  | { status: "mismatch"; message: string };

type PayloadInsight = {
  sourceLabel: string;
  parseError?: string;
  eventName: string;
  objectType: string;
  objectId: string;
  customerId: string;
  userEmail: string;
  status: string;
  amount: string;
  idempotencyKey: string;
  targetRecord: string;
  recommendedAction: string;
  riskChecks: string[];
};

type ReplayAttempt = {
  attempt: number;
  decision: "process" | "skip";
  status: string;
  note: string;
};

type SignatureSymptomId = (typeof signatureSymptoms)[number]["id"];
type ReadinessItemId = (typeof readinessItems)[number]["id"];
type IdempotencyProviderId = (typeof idempotencyProviders)[number]["id"];
type IdempotencyScopeId = (typeof idempotencyScopes)[number]["id"];

type SignatureDiagnosis = {
  severity: string;
  summary: string;
  primaryFix: string;
  frameworkFix: string;
  checks: string[];
  testCommand: string;
};

const proKitReferenceUsd = 9.7;

function normalizeSignatureInput(value: string) {
  return value.trim().replace(/^sha256=/i, "").toLowerCase();
}

async function copyTextToClipboard(value: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return;
    } catch {
      // Fall back for preview browsers or restricted clipboard contexts.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.append(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function readPath(value: unknown, path: string[]): unknown {
  return path.reduce<unknown>((current, key) => {
    if (current && typeof current === "object" && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, value);
}

function asDisplayValue(value: unknown, fallback = "Not present") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }
  return String(value);
}

function formatMinorAmount(total: unknown, currency: unknown) {
  if (typeof total !== "number" || !Number.isFinite(total)) {
    return "Not present";
  }
  const code = asDisplayValue(currency, "CNY").toUpperCase();
  return `${code} ${(total / 100).toFixed(2)}`;
}

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value >= 100 ? 0 : 2
  }).format(value);
}

function formatHours(value: number) {
  return `${value.toFixed(value % 1 === 0 ? 0 : 1)}h`;
}

function clampNumber(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function invalidPayloadInsight(sourceLabel: string, error: unknown): PayloadInsight {
  return {
    sourceLabel,
    parseError: error instanceof Error ? error.message : "Invalid JSON payload.",
    eventName: "Invalid JSON",
    objectType: "Invalid JSON",
    objectId: "Invalid JSON",
    customerId: "Invalid JSON",
    userEmail: "Invalid JSON",
    status: "Invalid JSON",
    amount: "Invalid JSON",
    idempotencyKey: "Invalid JSON",
    targetRecord: "Invalid JSON",
    recommendedAction: "Fix the raw JSON body before trusting provider fields or writing billing side effects.",
    riskChecks: [
      "Do not dispatch business logic from a payload that cannot be parsed as JSON.",
      "If signature verification still passes, inspect whether your raw body was copied with extra bytes or truncation.",
      "Keep invalid payload examples in CI so your handler rejects malformed events safely."
    ]
  };
}

function inspectPayload(payloadJson: string, sourceLabel: string): PayloadInsight {
  let payload: Record<string, unknown>;

  try {
    payload = JSON.parse(payloadJson) as Record<string, unknown>;
  } catch (error) {
    return invalidPayloadInsight(sourceLabel, error);
  }

  const eventName = asDisplayValue(readPath(payload, ["meta", "event_name"]), "unknown_event");
  const objectType = asDisplayValue(readPath(payload, ["data", "type"]), "unknown_object");
  const objectId = asDisplayValue(readPath(payload, ["data", "id"]), "missing_id");
  const attributes = readPath(payload, ["data", "attributes"]);
  const customerId = asDisplayValue(readPath(payload, ["data", "attributes", "customer_id"]));
  const userEmail = asDisplayValue(readPath(payload, ["data", "attributes", "user_email"]));
  const status = asDisplayValue(readPath(payload, ["data", "attributes", "status"]));
  const total = readPath(payload, ["data", "attributes", "total"]);
  const currency = readPath(payload, ["data", "attributes", "currency"]);
  const amount = formatMinorAmount(total, currency);
  const idempotencyKey = `lemonsqueezy:${eventName}:${objectType}:${objectId}`;

  let targetRecord = customerId !== "Not present" ? `customer:${customerId}` : `object:${objectId}`;
  let recommendedAction = "Verify the signature, persist the idempotency key, then dispatch by event name.";
  const riskChecks = [
    "Verify the HMAC signature before parsing business fields.",
    "Persist the idempotency key before granting access or sending emails.",
    "Return success for duplicate events after confirming the side effect already ran."
  ];

  if (eventName === "order_created") {
    recommendedAction = status === "paid" ? "Grant one-time purchase access after the idempotency key is stored." : "Do not grant access until the order is paid.";
    targetRecord = userEmail !== "Not present" ? `buyer:${userEmail}` : targetRecord;
  } else if (eventName === "subscription_created") {
    recommendedAction = "Create or activate the subscription entitlement for the mapped customer.";
    targetRecord = `subscription:${objectId}`;
  } else if (eventName === "subscription_payment_success") {
    recommendedAction = "Record the invoice payment and extend the subscription entitlement once.";
    const subscriptionId = asDisplayValue(readPath(payload, ["data", "attributes", "subscription_id"]));
    targetRecord = subscriptionId !== "Not present" ? `subscription:${subscriptionId}` : targetRecord;
  } else if (eventName === "subscription_cancelled") {
    recommendedAction = "Schedule entitlement removal using ends_at, or revoke access immediately if your policy requires it.";
    const endsAt = asDisplayValue(readPath(payload, ["data", "attributes", "ends_at"]));
    if (endsAt !== "Not present") {
      riskChecks.push(`Confirm cancellation effective date: ${endsAt}.`);
    }
    targetRecord = `subscription:${objectId}`;
  } else if (eventName === "license_key_created") {
    recommendedAction = "Store and deliver the license key, but log only a short key identifier.";
    targetRecord = `license:${objectId}`;
    riskChecks.push("Never log the full license key in request logs, CI output, or customer support screenshots.");
  }

  if (!attributes || typeof attributes !== "object") {
    riskChecks.push("Payload is missing data.attributes; reject or quarantine it after signature verification.");
  }

  return {
    sourceLabel,
    eventName,
    objectType,
    objectId,
    customerId,
    userEmail,
    status,
    amount,
    idempotencyKey,
    targetRecord,
    recommendedAction,
    riskChecks
  };
}

function buildReviewReport(params: {
  eventId: EventId;
  endpoint: string;
  framework: FrameworkId;
  insight: PayloadInsight;
  verification: VerificationState;
  signature: string;
}) {
  const { eventId, endpoint, framework, insight, verification, signature } = params;
  const checks = insight.riskChecks.map((check) => `- ${check}`).join("\n");
  const parseLine = insight.parseError ? `\nParse error: ${insight.parseError}\n` : "";
  const signatureLine =
    verification.status === "empty"
      ? "Not checked in the verifier"
      : `${verification.status.toUpperCase()} - ${verification.message}`;

  return `# Billing Webhook Review

Generated by BillingWebhookKit
${productUrl}

## Route Under Review

- Provider: Lemon Squeezy
- Event: ${eventId}
- Framework: ${framework}
- Endpoint: ${endpoint.trim() || defaultEndpoint}
- Inspector source: ${insight.sourceLabel}${parseLine}

## Signature Gate

- Generated fixture signature: ${signature || "Pending generation"}
- Verifier status: ${signatureLine}

## Trusted Fields After Verification

- Event name: ${insight.eventName}
- Object: ${insight.objectType}:${insight.objectId}
- Target record: ${insight.targetRecord}
- Customer: ${insight.customerId}
- Buyer email: ${insight.userEmail}
- Status: ${insight.status}
- Amount: ${insight.amount}
- Recommended idempotency key: ${insight.idempotencyKey}

## Handler Decision

${insight.recommendedAction}

## Safety Checks

${checks}

## Release Note

Keep this report with the route PR or release checklist. Re-run it after changing raw-body parsing, signature verification, event mapping, entitlement writes, or retry handling.`;
}

function buildReplayAttempts(insight: PayloadInsight): ReplayAttempt[] {
  if (insight.parseError) {
    return [
      {
        attempt: 1,
        decision: "skip",
        status: "Reject malformed payload",
        note: "Do not write billing side effects until the raw body parses after signature verification."
      },
      {
        attempt: 2,
        decision: "skip",
        status: "Still rejected",
        note: "Repeated invalid payloads should stay quarantined and should not create processed-event records."
      },
      {
        attempt: 3,
        decision: "skip",
        status: "Still rejected",
        note: "Alert or sample logs without leaking webhook secrets or raw production payloads."
      }
    ];
  }

  return [
    {
      attempt: 1,
      decision: "process",
      status: "Process once",
      note: `Store ${insight.idempotencyKey}, then run the handler side effect.`
    },
    {
      attempt: 2,
      decision: "skip",
      status: "Skip duplicate",
      note: "Return a successful response after confirming the stored idempotency key already ran."
    },
    {
      attempt: 3,
      decision: "skip",
      status: "Skip duplicate",
      note: "Do not send another email, grant access twice, or rewrite billing state."
    }
  ];
}

function buildReplayTestSnippet(insight: PayloadInsight, eventId: EventId) {
  const idempotencyKey = insight.parseError ? "invalid-payload" : insight.idempotencyKey;
  const expectedSideEffects = insight.parseError ? 0 : 1;
  const expectedDuplicates = insight.parseError ? 0 : 2;

  return `import { describe, expect, it } from "vitest";
import fixture from "./fixtures/lemon-${eventId}.json";

function idempotencyKey() {
  return "${idempotencyKey}";
}

describe("Lemon Squeezy ${eventId} duplicate replay", () => {
  it("runs the billing side effect only once", async () => {
    const processed = new Set<string>();
    let sideEffects = 0;
    let duplicates = 0;

    for (const _delivery of [fixture, fixture, fixture]) {
      const key = idempotencyKey();

      if (processed.has(key)) {
        duplicates += 1;
        continue;
      }

      processed.add(key);
      sideEffects += 1;
    }

    expect(sideEffects).toBe(${expectedSideEffects});
    expect(duplicates).toBe(${expectedDuplicates});
  });
});`;
}

function buildContractTestSnippet(insight: PayloadInsight, eventId: EventId) {
  if (insight.parseError) {
    return `import { describe, expect, it } from "vitest";

describe("Lemon Squeezy ${eventId} webhook contract", () => {
  it("rejects malformed webhook JSON before billing side effects", () => {
    const rawBody = "{invalid json";

    expect(() => JSON.parse(rawBody)).toThrow();
  });
});`;
  }

  const customerAssertion =
    insight.customerId === "Not present"
      ? "expect(fixture.data.attributes.customer_id).toBeUndefined();"
      : `expect(String(fixture.data.attributes.customer_id)).toBe(${JSON.stringify(insight.customerId)});`;
  const currencyCode = insight.amount.includes(" ") ? insight.amount.split(" ")[0] : "";
  const currencyAssertion =
    currencyCode && currencyCode !== "Not"
      ? `expect(String(fixture.data.attributes.currency).toUpperCase()).toBe(${JSON.stringify(currencyCode)});`
      : "expect(fixture.data.attributes.currency).toBeUndefined();";

  return `import { describe, expect, it } from "vitest";
import fixture from "./fixtures/lemon-${eventId}.json";

describe("Lemon Squeezy ${eventId} webhook contract", () => {
  it("keeps trusted billing fields stable", () => {
    expect(fixture.meta.event_name).toBe(${JSON.stringify(insight.eventName)});
    expect(fixture.data.type).toBe(${JSON.stringify(insight.objectType)});
    expect(fixture.data.id).toBe(${JSON.stringify(insight.objectId)});
    expect(fixture.data.attributes.status).toBe(${JSON.stringify(insight.status)});
    ${customerAssertion}
    ${currencyAssertion}
  });

  it("derives the same idempotency key before side effects", () => {
    const key = [
      "lemonsqueezy",
      fixture.meta.event_name,
      fixture.data.type,
      fixture.data.id
    ].join(":");

    expect(key).toBe("${insight.idempotencyKey}");
  });
});`;
}

function buildContractReport(params: { eventId: EventId; framework: FrameworkId; insight: PayloadInsight; snippet: string }) {
  const { eventId, framework, insight, snippet } = params;

  return `# Payment Webhook Contract Test

Generated by BillingWebhookKit
${productUrl}

## Contract Target

- Provider: Lemon Squeezy
- Event: ${eventId}
- Framework: ${framework}
- Inspector source: ${insight.sourceLabel}
- Event name: ${insight.eventName}
- Object: ${insight.objectType}:${insight.objectId}
- Status: ${insight.status}
- Customer: ${insight.customerId}
- Amount: ${insight.amount}
- Idempotency key: ${insight.idempotencyKey}

## Vitest Contract

\`\`\`ts
${snippet}
\`\`\`

## Release Rule

Keep this contract beside the webhook route test. Update it only when the provider payload shape, entitlement mapping, or idempotency key policy intentionally changes.`;
}

function buildEntitlementMatrixMarkdown() {
  const rows = entitlementRows
    .map(
      (row) =>
        `| ${row.event} | ${row.state} | ${row.decision} | ${row.writeModel} | ${row.testCase} |`
    )
    .join("\n");

  return `# Payment Webhook Entitlement Decision Matrix

Use this before a billing launch to decide which webhook events are allowed to grant, extend, revoke, or quarantine customer access.

| Event | State | Handler decision | Write model | Regression test |
| --- | --- | --- | --- | --- |
${rows}

Release rule: verify the signature first, persist an idempotency key, then run the entitlement decision once. Duplicate deliveries should return success without repeating the side effect.`;
}

function frameworkRawBodyFix(framework: FrameworkId) {
  if (framework === "next") {
    return "In Next.js App Router, call await request.text() once and verify that exact string before JSON.parse. Do not call request.json() before HMAC verification.";
  }

  if (framework === "hono") {
    return "In Hono, read await c.req.text() for verification and parse JSON only after the digest matches. Avoid middleware that consumes or rewrites the body first.";
  }

  return "In Express, use express.raw({ type: 'application/json' }) on the webhook route, then verify req.body bytes before JSON.parse. Do not use express.json() before HMAC verification.";
}

function buildSignatureDiagnosis(
  symptom: SignatureSymptomId,
  framework: FrameworkId,
  verification: VerificationState
): SignatureDiagnosis {
  const frameworkFix = frameworkRawBodyFix(framework);
  const baseChecks = [
    "Capture the exact raw request body bytes from the webhook route before parsing.",
    "Normalize the signature header by trimming whitespace and removing a leading sha256= prefix only when the provider uses that form.",
    "Compare against the endpoint webhook signing secret, not the Lemon Squeezy API key or checkout URL.",
    "Keep a fixture and one signature test in CI so the route fails fast when parsing changes."
  ];

  if (verification.status === "match") {
    return {
      severity: "Verifier passed",
      summary: "The pasted raw body, signature header, and secret match in the browser verifier. The bug is likely in the server route, middleware order, or a different production secret.",
      primaryFix: "Copy the exact raw body fixture into your route test and compare the server-computed digest against the browser-computed digest.",
      frameworkFix,
      checks: baseChecks,
      testCommand: "npm test -- webhook-signature"
    };
  }

  const symptomMap: Record<SignatureSymptomId, SignatureDiagnosis> = {
    raw_body_changed: {
      severity: "High probability",
      summary: "Signature mismatches usually happen because JSON was parsed, re-stringified, pretty-printed, trimmed, or transcoded before HMAC verification.",
      primaryFix: "Verify the HMAC against the exact raw request body string or bytes received from the provider, then parse JSON only after the signature matches.",
      frameworkFix,
      checks: [
        "Do not call JSON.stringify(payload) to rebuild the signed body.",
        "Do not trim trailing newlines, change spacing, sort keys, or decode and re-encode the request before verification.",
        ...baseChecks
      ],
      testCommand: "npm test -- raw-body-signature"
    },
    wrong_secret: {
      severity: "High probability",
      summary: "The signature can be computed correctly and still fail when the route uses the wrong secret source.",
      primaryFix: "Load the webhook endpoint signing secret from environment configuration and verify it differs from API keys, store IDs, variant IDs, and checkout URLs.",
      frameworkFix,
      checks: [
        "Check that staging and production webhook endpoints use the matching environment secret.",
        "Rotate old copied secrets out of local .env files and deployment settings.",
        ...baseChecks
      ],
      testCommand: "npm test -- signing-secret"
    },
    header_format: {
      severity: "Medium probability",
      summary: "Header mismatches often come from comparing the wrong header value format rather than the digest itself.",
      primaryFix: "Read the provider's signature header exactly, strip only documented prefixes, lowercase hex for comparison, and use constant-time comparison in the handler.",
      frameworkFix,
      checks: [
        "Confirm the route reads x-signature for Lemon Squeezy fixtures.",
        "Reject missing or non-hex signatures before running business logic.",
        ...baseChecks
      ],
      testCommand: "npm test -- signature-header"
    },
    framework_parser: {
      severity: "High probability",
      summary: "Framework defaults often parse the body before your handler sees it, which destroys the bytes the provider signed.",
      primaryFix: "Move signature verification to the first route-specific step and disable or bypass generic JSON parsing middleware for the webhook endpoint.",
      frameworkFix,
      checks: [
        "Keep webhook routes separate from normal authenticated JSON API routes.",
        "Add a test that fails if the raw body is consumed before verification.",
        ...baseChecks
      ],
      testCommand: "npm test -- webhook-route-parser"
    },
    local_replay: {
      severity: "Medium probability",
      summary: "cURL replay mismatches usually come from shell escaping, changed file bytes, or a signature generated for a different payload.",
      primaryFix: "Save the payload to a fixture file, sign that exact file content, and replay with --data-binary instead of inline shell JSON.",
      frameworkFix,
      checks: [
        "Use --data-binary @fixture.json so cURL does not alter the request body.",
        "Regenerate the signature after every fixture edit.",
        ...baseChecks
      ],
      testCommand: "npm test -- webhook-replay"
    }
  };

  return symptomMap[symptom];
}

function buildSignatureDiagnosisMarkdown(params: {
  framework: FrameworkId;
  symptom: SignatureSymptomId;
  verification: VerificationState;
  diagnosis: SignatureDiagnosis;
}) {
  const symptom = signatureSymptoms.find((item) => item.id === params.symptom) ?? signatureSymptoms[0];
  const checks = params.diagnosis.checks.map((check) => `- ${check}`).join("\n");

  return `# Webhook Signature Mismatch Debug Report

Generated by BillingWebhookKit
${productUrl}

## Symptom

- Framework: ${params.framework}
- Selected symptom: ${symptom.label}
- Signal: ${symptom.signal}
- Browser verifier state: ${params.verification.status.toUpperCase()} - ${params.verification.message}

## Diagnosis

- Severity: ${params.diagnosis.severity}
- Summary: ${params.diagnosis.summary}
- Primary fix: ${params.diagnosis.primaryFix}

## Framework Fix

${params.diagnosis.frameworkFix}

## Checks

${checks}

## Regression Test

Run or add a focused signature test:

\`\`\`bash
${params.diagnosis.testCommand}
\`\`\`

Keep this report with the webhook route PR. Re-run the verifier after changing middleware, request parsing, deployment secrets, or provider endpoint settings.`;
}

function readinessLevel(score: number) {
  if (score >= 85) {
    return {
      label: "Launch-ready",
      summary: "Core billing failure modes have evidence. Run the live checkout smoke test before opening paid traffic."
    };
  }

  if (score >= 65) {
    return {
      label: "Needs focused review",
      summary: "The route has useful coverage, but at least one launch-critical gap remains."
    };
  }

  if (score >= 40) {
    return {
      label: "High launch risk",
      summary: "The integration still depends on manual confidence for several billing safety checks."
    };
  }

  return {
    label: "Not ready",
    summary: "Do not launch paid checkout until signature, retry, entitlement, and smoke-test evidence exists."
  };
}

function buildReadinessReport(selectedIds: ReadinessItemId[], score: number) {
  const selected = new Set(selectedIds);
  const level = readinessLevel(score);
  const complete = readinessItems.filter((item) => selected.has(item.id));
  const missing = readinessItems.filter((item) => !selected.has(item.id));
  const completeLines = complete.length
    ? complete.map((item) => `- [x] ${item.area}: ${item.label} - ${item.evidence}`).join("\n")
    : "- None yet.";
  const missingLines = missing.length
    ? missing.map((item) => `- [ ] ${item.area}: ${item.label} - Risk: ${item.risk}`).join("\n")
    : "- No missing launch gates in this checklist.";

  return `# Billing Webhook Launch Readiness Report

Generated by BillingWebhookKit
${productUrl}

## Score

- Score: ${score}/100
- Level: ${level.label}
- Summary: ${level.summary}

## Evidence Present

${completeLines}

## Missing Gates

${missingLines}

## Release Rule

Launch paid checkout only after the deployed route has a signature fixture test, duplicate replay test, entitlement decision matrix, environment-specific secrets, and a checkout-to-webhook smoke test.`;
}

function normalizeKeyPart(value: string, fallback: string) {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._:-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || fallback;
}

function buildIdempotencyKey(params: {
  provider: IdempotencyProviderId;
  eventName: string;
  objectId: string;
  scope: IdempotencyScopeId;
}) {
  return [
    normalizeKeyPart(params.provider, "provider"),
    normalizeKeyPart(params.scope, "scope"),
    normalizeKeyPart(params.eventName, "event"),
    normalizeKeyPart(params.objectId, "object")
  ].join(":");
}

function buildIdempotencySnippet(key: string) {
  return `const processed = await db.processedWebhook.findUnique({
  where: { idempotencyKey: "${key}" }
});

if (processed) {
  return new Response("duplicate", { status: 200 });
}

await db.processedWebhook.create({
  data: {
    idempotencyKey: "${key}",
    processedAt: new Date()
  }
});

// Run the billing side effect exactly once after the key is stored.`;
}

function buildIdempotencyReport(params: {
  provider: IdempotencyProviderId;
  providerLabel: string;
  eventName: string;
  objectId: string;
  scope: IdempotencyScopeId;
  key: string;
  snippet: string;
}) {
  const scope = idempotencyScopes.find((item) => item.id === params.scope) ?? idempotencyScopes[0];

  return `# Webhook Idempotency Key Report

Generated by BillingWebhookKit
${productUrl}

## Key

- Provider: ${params.providerLabel}
- Event name: ${params.eventName}
- Object ID: ${params.objectId}
- Scope: ${scope.label} - ${scope.note}
- Idempotency key: \`${params.key}\`

## Database Constraint

\`\`\`sql
create unique index processed_webhooks_idempotency_key_idx
on processed_webhooks (idempotency_key);
\`\`\`

## Handler Guard

\`\`\`ts
${params.snippet}
\`\`\`

## Replay Rule

Store this key before sending emails, delivering licenses, granting access, extending renewals, or scheduling cancellations. Duplicate deliveries should return success after confirming the key already exists.`;
}

export function App() {
  const [eventId, setEventId] = useState<EventId>("order_created");
  const [framework, setFramework] = useState<FrameworkId>("next");
  const [activeTab, setActiveTab] = useState<OutputTab>("payload");
  const [secret, setSecret] = useState("test_webhook_secret");
  const [endpoint, setEndpoint] = useState(defaultEndpoint);
  const [signature, setSignature] = useState("");
  const [verifyPayload, setVerifyPayload] = useState("");
  const [verifySecret, setVerifySecret] = useState("test_webhook_secret");
  const [verifySignature, setVerifySignature] = useState("");
  const [verifyExpectedSignature, setVerifyExpectedSignature] = useState("");
  const [copied, setCopied] = useState(false);
  const [insightCopied, setInsightCopied] = useState(false);
  const [reportCopied, setReportCopied] = useState(false);
  const [replayCopied, setReplayCopied] = useState(false);
  const [matrixCopied, setMatrixCopied] = useState(false);
  const [diagnosisCopied, setDiagnosisCopied] = useState(false);
  const [readinessCopied, setReadinessCopied] = useState(false);
  const [idempotencyCopied, setIdempotencyCopied] = useState(false);
  const [contractCopied, setContractCopied] = useState(false);
  const [signatureSymptom, setSignatureSymptom] = useState<SignatureSymptomId>("raw_body_changed");
  const [readinessSelected, setReadinessSelected] = useState<ReadinessItemId[]>([
    "raw_signature_test",
    "duplicate_replay",
    "entitlement_matrix",
    "review_report"
  ]);
  const [idempotencyProvider, setIdempotencyProvider] = useState<IdempotencyProviderId>("lemonsqueezy");
  const [idempotencyScope, setIdempotencyScope] = useState<IdempotencyScopeId>("event");
  const [idempotencyEventName, setIdempotencyEventName] = useState("order_created");
  const [idempotencyObjectId, setIdempotencyObjectId] = useState("order_1042");
  const [hourlyRate, setHourlyRate] = useState(75);
  const [debugHours, setDebugHours] = useState(4);
  const [billingLaunches, setBillingLaunches] = useState(2);
  const [runtimeCheckoutUrl, setRuntimeCheckoutUrl] = useState("");

  const checkoutUrl = runtimeCheckoutUrl || import.meta.env.VITE_LEMON_CHECKOUT_URL || "";
  const selectedEvent = lemonEvents.find((event) => event.id === eventId) ?? lemonEvents[0];
  const payload = useMemo(() => buildLemonPayload(eventId), [eventId]);
  const payloadJson = useMemo(() => asJson(payload), [payload]);
  const inspectorSource = verifyPayload.trim() ? verifyPayload : payloadJson;
  const inspectorSourceLabel = verifyPayload.trim() ? "Verifier raw body" : "Generated fixture";
  const payloadInsight = useMemo(
    () => inspectPayload(inspectorSource, inspectorSourceLabel),
    [inspectorSource, inspectorSourceLabel]
  );

  useEffect(() => {
    let cancelled = false;

    fetch(`${import.meta.env.BASE_URL}checkout.json`, { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((config: CheckoutConfig | null) => {
        if (!cancelled && config?.checkoutUrl) {
          setRuntimeCheckoutUrl(config.checkoutUrl);
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    hmacSha256Hex(secret, payloadJson)
      .then((nextSignature) => {
        if (!cancelled) {
          setSignature(nextSignature);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSignature("");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [payloadJson, secret]);

  useEffect(() => {
    let cancelled = false;
    const body = verifyPayload;

    if (!body || !verifySecret) {
      setVerifyExpectedSignature("");
      return () => {
        cancelled = true;
      };
    }

    hmacSha256Hex(verifySecret, body)
      .then((nextSignature) => {
        if (!cancelled) {
          setVerifyExpectedSignature(nextSignature);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setVerifyExpectedSignature("");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [verifyPayload, verifySecret]);

  const outputs: Record<OutputTab, string> = {
    payload: payloadJson,
    signature: `X-Signature: ${signature || "GENERATING_SIGNATURE"}
X-Event-Name: ${eventId}

Algorithm: HMAC-SHA256
Signed bytes: exact raw JSON request body
Header casing: x-signature / X-Signature`,
    curl: curlCommand(endpoint, eventId, signature, payloadJson),
    handler: handlerTemplate(framework),
    test: testTemplate(eventId)
  };

  const currentOutput = outputs[activeTab];
  const normalizedVerifySignature = normalizeSignatureInput(verifySignature);
  const verification: VerificationState = !verifyPayload.trim()
    ? { status: "empty", message: "Paste the exact raw request body to verify a webhook signature." }
    : !normalizedVerifySignature
      ? { status: "empty", message: "Paste the x-signature header value to compare against the computed HMAC." }
      : !/^[a-f0-9]{64}$/.test(normalizedVerifySignature)
        ? { status: "invalid", message: "Signature must be a 64-character SHA-256 hex digest." }
        : verifyExpectedSignature && normalizedVerifySignature === verifyExpectedSignature
          ? { status: "match", message: "Signature matches this raw body and secret." }
          : { status: "mismatch", message: "Signature does not match. Check raw body bytes, secret, and header value." };
  const reviewReport = useMemo(
    () =>
      buildReviewReport({
        eventId,
        endpoint,
        framework,
        insight: payloadInsight,
        verification,
        signature
      }),
    [endpoint, eventId, framework, payloadInsight, signature, verification]
  );
  const replayAttempts = useMemo(() => buildReplayAttempts(payloadInsight), [payloadInsight]);
  const replayTestSnippet = useMemo(
    () => buildReplayTestSnippet(payloadInsight, eventId),
    [eventId, payloadInsight]
  );
  const contractTestSnippet = useMemo(
    () => buildContractTestSnippet(payloadInsight, eventId),
    [eventId, payloadInsight]
  );
  const contractReport = useMemo(
    () =>
      buildContractReport({
        eventId,
        framework,
        insight: payloadInsight,
        snippet: contractTestSnippet
      }),
    [contractTestSnippet, eventId, framework, payloadInsight]
  );
  const entitlementMatrixMarkdown = useMemo(() => buildEntitlementMatrixMarkdown(), []);
  const signatureDiagnosis = useMemo(
    () => buildSignatureDiagnosis(signatureSymptom, framework, verification),
    [framework, signatureSymptom, verification]
  );
  const signatureDiagnosisMarkdown = useMemo(
    () =>
      buildSignatureDiagnosisMarkdown({
        framework,
        symptom: signatureSymptom,
        verification,
        diagnosis: signatureDiagnosis
      }),
    [framework, signatureDiagnosis, signatureSymptom, verification]
  );
  const readinessScore = useMemo(() => {
    const selected = new Set(readinessSelected);
    return readinessItems.reduce((total, item) => total + (selected.has(item.id) ? item.weight : 0), 0);
  }, [readinessSelected]);
  const currentReadinessLevel = readinessLevel(readinessScore);
  const readinessReport = useMemo(
    () => buildReadinessReport(readinessSelected, readinessScore),
    [readinessScore, readinessSelected]
  );
  const selectedIdempotencyProvider =
    idempotencyProviders.find((provider) => provider.id === idempotencyProvider) ?? idempotencyProviders[0];
  const idempotencyKey = useMemo(
    () =>
      buildIdempotencyKey({
        provider: idempotencyProvider,
        eventName: idempotencyEventName,
        objectId: idempotencyObjectId,
        scope: idempotencyScope
      }),
    [idempotencyEventName, idempotencyObjectId, idempotencyProvider, idempotencyScope]
  );
  const idempotencySnippet = useMemo(() => buildIdempotencySnippet(idempotencyKey), [idempotencyKey]);
  const idempotencyReport = useMemo(
    () =>
      buildIdempotencyReport({
        provider: idempotencyProvider,
        providerLabel: selectedIdempotencyProvider.label,
        eventName: idempotencyEventName,
        objectId: idempotencyObjectId,
        scope: idempotencyScope,
        key: idempotencyKey,
        snippet: idempotencySnippet
      }),
    [
      idempotencyEventName,
      idempotencyKey,
      idempotencyObjectId,
      idempotencyProvider,
      idempotencyScope,
      idempotencySnippet,
      selectedIdempotencyProvider.label
    ]
  );
  const annualDebugCost = hourlyRate * debugHours * billingLaunches;
  const breakEvenMinutes = hourlyRate > 0 ? (proKitReferenceUsd / hourlyRate) * 60 : 0;
  const estimatedMultiple = proKitReferenceUsd > 0 ? annualDebugCost / proKitReferenceUsd : 0;

  async function copyCurrentOutput() {
    await copyTextToClipboard(currentOutput);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  async function copyIdempotencyKey() {
    if (payloadInsight.parseError) {
      return;
    }

    await copyTextToClipboard(payloadInsight.idempotencyKey);
    setInsightCopied(true);
    window.setTimeout(() => setInsightCopied(false), 1400);
  }

  function downloadCurrentOutput() {
    const extension = activeTab === "payload" ? "json" : "txt";
    downloadText(`billing-webhook-kit-${eventId}-${activeTab}.${extension}`, currentOutput);
  }

  async function copyReviewReport() {
    await copyTextToClipboard(reviewReport);
    setReportCopied(true);
    window.setTimeout(() => setReportCopied(false), 1400);
  }

  function downloadReviewReport() {
    downloadText(`billing-webhook-kit-${eventId}-review.md`, reviewReport, "text/markdown");
  }

  async function copyReplayTest() {
    await copyTextToClipboard(replayTestSnippet);
    setReplayCopied(true);
    window.setTimeout(() => setReplayCopied(false), 1400);
  }

  function downloadReplayTest() {
    downloadText(`billing-webhook-kit-${eventId}-replay.test.ts`, replayTestSnippet, "text/typescript");
  }

  async function copyContractTest() {
    await copyTextToClipboard(contractReport);
    setContractCopied(true);
    window.setTimeout(() => setContractCopied(false), 1400);
  }

  function downloadContractTest() {
    downloadText(`billing-webhook-kit-${eventId}-contract.test.ts`, contractTestSnippet, "text/typescript");
  }

  async function copyEntitlementMatrix() {
    await copyTextToClipboard(entitlementMatrixMarkdown);
    setMatrixCopied(true);
    window.setTimeout(() => setMatrixCopied(false), 1400);
  }

  function downloadEntitlementMatrix() {
    downloadText("billing-webhook-entitlement-decision-matrix.md", entitlementMatrixMarkdown, "text/markdown");
  }

  async function copySignatureDiagnosis() {
    await copyTextToClipboard(signatureDiagnosisMarkdown);
    setDiagnosisCopied(true);
    window.setTimeout(() => setDiagnosisCopied(false), 1400);
  }

  function downloadSignatureDiagnosis() {
    downloadText("webhook-signature-mismatch-debug-report.md", signatureDiagnosisMarkdown, "text/markdown");
  }

  function toggleReadinessItem(id: ReadinessItemId) {
    setReadinessSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }

  async function copyReadinessReport() {
    await copyTextToClipboard(readinessReport);
    setReadinessCopied(true);
    window.setTimeout(() => setReadinessCopied(false), 1400);
  }

  function downloadReadinessReport() {
    downloadText("billing-webhook-launch-readiness-report.md", readinessReport, "text/markdown");
  }

  function loadIdempotencyProviderDefaults(providerId: IdempotencyProviderId) {
    const provider = idempotencyProviders.find((item) => item.id === providerId) ?? idempotencyProviders[0];
    setIdempotencyProvider(provider.id);
    setIdempotencyEventName(provider.defaultEvent);
    setIdempotencyObjectId(provider.defaultObject);
  }

  async function copyIdempotencyReport() {
    await copyTextToClipboard(idempotencyReport);
    setIdempotencyCopied(true);
    window.setTimeout(() => setIdempotencyCopied(false), 1400);
  }

  function downloadIdempotencyReport() {
    downloadText("webhook-idempotency-key-report.md", idempotencyReport, "text/markdown");
  }

  function loadGeneratedPayloadForVerification() {
    setVerifyPayload(payloadJson);
    setVerifySecret(secret);
    setVerifySignature(signature);
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Payment Webhook Lab</p>
          <h1>BillingWebhookKit</h1>
        </div>
        <div className="topbar__actions">
          <a className="ghost-link" href="free-sample.html">
            Free sample
          </a>
          <a className="ghost-link" href="status.html">
            Status
          </a>
          <a className="ghost-link" href="delivery-refund-support.html">
            Delivery
          </a>
          <a className="ghost-link" href="billing-webhook-launch-evidence-pack.html">
            Evidence
          </a>
          <a className="ghost-link" href="billing-webhook-kit-pro-sample-report.html">
            Sample report
          </a>
          <a className="ghost-link" href="tools/">
            Tools
          </a>
          <a className="ghost-link" href="troubleshooting.html">
            Troubleshoot
          </a>
          <a className="ghost-link" href="tools/lemon-squeezy-signature-verifier.html">
            Verifier
          </a>
          <a className="ghost-link" href="tools/lemon-squeezy-webhook-payload-generator.html">
            Payloads
          </a>
          <a className="ghost-link" href="tools/webhook-idempotency-key-generator.html">
            Idempotency
          </a>
          <a className="ghost-link" href="tools/stripe-webhook-fixture-generator.html">
            Stripe
          </a>
          <a className="ghost-link" href="tools/webhook-replay-curl-generator.html">
            Replay
          </a>
          <a className="ghost-link" href="tools/nextjs-webhook-handler-generator.html">
            Next.js
          </a>
          <a className="ghost-link" href="tools/nextjs-lemon-squeezy-raw-body-audit.html">
            Raw-body audit
          </a>
          <a className="ghost-link" href="tools/vercel-lemon-squeezy-webhook-debugger.html">
            Vercel debug
          </a>
          <a className="ghost-link" href="guides/nextjs-webhook-405-lemon-squeezy.html">
            405 fix
          </a>
          <a className="ghost-link" href="tools/billing-webhook-launch-readiness-scorecard.html">
            Score
          </a>
          <a className="ghost-link" href="tools/billing-webhook-pro-fit-checker.html">
            Fit
          </a>
          <a className="ghost-link" href="tools/lemon-squeezy-paypal-live-checkout-report.html">
            PayPal
          </a>
          <a className="ghost-link" href="pro-kit.html">
            Pro Kit preview
          </a>
          {checkoutUrl ? (
            <a className="buy-button" href={checkoutUrl} target="_blank" rel="noreferrer">
              <PackageCheck size={18} aria-hidden="true" />
              Buy Pro
              <ExternalLink size={15} aria-hidden="true" />
            </a>
          ) : (
            <button className="buy-button buy-button--disabled" disabled>
              <PackageCheck size={18} aria-hidden="true" />
              Checkout opening soon
            </button>
          )}
        </div>
      </header>

      <section className="workbench" aria-label="Webhook fixture generator">
        <aside className="panel control-panel">
          <div className="panel__header">
            <ShieldCheck size={20} aria-hidden="true" />
            <div>
              <h2>Fixture Input</h2>
              <p>Local signing only</p>
            </div>
          </div>

          <label className="field">
            <span>Payment platform</span>
            <select value="lemonsqueezy" aria-label="Payment platform" onChange={() => undefined}>
              {platforms.map((platform) => (
                <option key={platform.id} value={platform.id} disabled={platform.status === "pro"}>
                  {platform.name}
                  {platform.status === "pro" ? " - Pro" : ""}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Webhook event</span>
            <select value={eventId} onChange={(event) => setEventId(event.target.value as EventId)}>
              {lemonEvents.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>
          </label>

          <div className="event-strip">
            <span>{selectedEvent.group}</span>
            <strong>{selectedEvent.description}</strong>
          </div>

          <label className="field">
            <span>Test signing secret</span>
            <input
              value={secret}
              onChange={(event) => setSecret(event.target.value)}
              spellCheck={false}
              autoComplete="off"
            />
          </label>

          <label className="field">
            <span>Replay endpoint</span>
            <input
              value={endpoint}
              onChange={(event) => setEndpoint(event.target.value)}
              spellCheck={false}
              autoComplete="off"
            />
          </label>

          <div className="segmented" aria-label="Framework">
            {frameworks.map((item) => (
              <button
                key={item.id}
                className={framework === item.id ? "is-active" : ""}
                onClick={() => setFramework(item.id)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </div>
        </aside>

        <section className="panel output-panel">
          <div className="panel__header output-head">
            <div>
              <h2>Generated Output</h2>
              <p>{eventId}</p>
            </div>
            <div className="tool-actions">
              <button onClick={copyCurrentOutput} type="button" title="Copy current output">
                {copied ? <Check size={17} aria-hidden="true" /> : <Clipboard size={17} aria-hidden="true" />}
                {copied ? "Copied" : "Copy"}
              </button>
              <button onClick={downloadCurrentOutput} type="button" title="Download current output">
                <Download size={17} aria-hidden="true" />
                Download
              </button>
            </div>
          </div>

          <div className="tabs" role="tablist" aria-label="Generated output">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={activeTab === tab.id ? "is-active" : ""}
                  onClick={() => setActiveTab(tab.id)}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  type="button"
                >
                  <Icon size={16} aria-hidden="true" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <pre className="code-window" aria-live="polite">
            <code>{currentOutput}</code>
          </pre>
        </section>

        <aside className="panel pro-panel" id="pro-kit">
          <div className="panel__header">
            <PackageCheck size={20} aria-hidden="true" />
            <div>
              <h2>Pro Kit</h2>
              <p>Digital download</p>
            </div>
          </div>

          <div className="price-block">
            <span>Launch price</span>
            <strong>¥69</strong>
          </div>

          <ul className="pro-list">
            <li>Lemon Squeezy complete fixture library</li>
            <li>Stripe, Paddle, Polar starter events</li>
            <li>Next.js, Hono, Express, Workers templates</li>
            <li>Vitest signature and replay test suite</li>
            <li>PR-ready review report templates</li>
            <li>GitHub Actions billing webhook checks</li>
          </ul>

          {checkoutUrl ? (
            <a className="wide-cta" href={checkoutUrl} target="_blank" rel="noreferrer">
              Buy BillingWebhookKit Pro
              <ExternalLink size={16} aria-hidden="true" />
            </a>
          ) : (
            <button className="wide-cta wide-cta--disabled" disabled>
              Checkout opening soon
            </button>
          )}

          <a className="wide-cta wide-cta--secondary" href="pro-kit.html">
            Preview contents
          </a>

          <a className="wide-cta wide-cta--secondary" href="free-sample.html">
            Download sample
          </a>

          <a className="wide-cta wide-cta--secondary" href="delivery-refund-support.html">
            Delivery, refund, and support
          </a>

          <a className="wide-cta wide-cta--secondary" href="billing-webhook-launch-evidence-pack.html">
            Review launch evidence
          </a>

          <a className="wide-cta wide-cta--secondary" href="tools/lemon-squeezy-production-checkout-readiness-report.html">
            Production checkout report
          </a>

          <a className="wide-cta wide-cta--secondary" href="tools/lemon-squeezy-paypal-live-checkout-report.html">
            PayPal live checkout report
          </a>

          <a className="wide-cta wide-cta--secondary" href="status.html">
            Verify status
          </a>

          <div className="trust-row">
            <span>Browser-only generator</span>
            <span>No account required</span>
            <span>Automated site health checks</span>
          </div>
        </aside>
      </section>

      <section className="inspector-panel" aria-label="Webhook payload inspector">
        <div className="inspector-panel__copy">
          <p className="eyebrow">Payload Inspector</p>
          <h2>Extract the fields your handler should trust after signature verification</h2>
          <p>
            Inspect the generated fixture or the raw body pasted into the signature verifier to identify
            the event, target record, payment state, and idempotency key before writing side effects.
          </p>
        </div>

        <div className="inspector-grid">
          <div className="inspector-card inspector-card--key">
            <div>
              <span>Recommended idempotency key</span>
              <strong>{payloadInsight.idempotencyKey}</strong>
            </div>
            <button
              type="button"
              onClick={copyIdempotencyKey}
              title="Copy idempotency key"
              disabled={Boolean(payloadInsight.parseError)}
            >
              {insightCopied ? <Check size={17} aria-hidden="true" /> : <Fingerprint size={17} aria-hidden="true" />}
              {insightCopied ? "Copied" : "Copy"}
            </button>
          </div>

          <div className={`inspector-source ${payloadInsight.parseError ? "inspector-source--error" : ""}`}>
            <span>Inspector source</span>
            <strong>{payloadInsight.sourceLabel}</strong>
            {payloadInsight.parseError ? <p>{payloadInsight.parseError}</p> : null}
          </div>

          <dl className="inspector-facts">
            <div>
              <dt>Event</dt>
              <dd>{payloadInsight.eventName}</dd>
            </div>
            <div>
              <dt>Object</dt>
              <dd>
                {payloadInsight.objectType}:{payloadInsight.objectId}
              </dd>
            </div>
            <div>
              <dt>Target</dt>
              <dd>{payloadInsight.targetRecord}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{payloadInsight.status}</dd>
            </div>
            <div>
              <dt>Amount</dt>
              <dd>{payloadInsight.amount}</dd>
            </div>
            <div>
              <dt>Customer</dt>
              <dd>{payloadInsight.customerId}</dd>
            </div>
          </dl>

          <div className="inspector-card">
            <div className="inspector-card__head">
              <ListChecks size={18} aria-hidden="true" />
              <span>Handler action</span>
            </div>
            <p>{payloadInsight.recommendedAction}</p>
          </div>

          <ul className="risk-list" aria-label="Webhook safety checks">
            {payloadInsight.riskChecks.map((check) => (
              <li key={check}>{check}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="verifier-panel" aria-label="Webhook signature verifier">
        <div className="verifier-panel__copy">
          <p className="eyebrow">Signature Verifier</p>
          <h2>Check whether a received webhook signature matches the exact raw body</h2>
          <p>
            Paste the raw request body, signing secret, and x-signature header. Verification runs locally
            in the browser with Web Crypto, so the secret never leaves this page.
          </p>
          <button className="inline-tool-button" type="button" onClick={loadGeneratedPayloadForVerification}>
            <FileJson size={16} aria-hidden="true" />
            Use generated fixture
          </button>
        </div>

        <div className="verifier-grid">
          <label className="verify-field verify-field--body">
            <span>Raw request body</span>
            <textarea
              value={verifyPayload}
              onChange={(event) => setVerifyPayload(event.target.value)}
              spellCheck={false}
              placeholder='{"meta":{"event_name":"order_created"},"data":{...}}'
            />
          </label>

          <div className="verify-stack">
            <label className="verify-field">
              <span>Signing secret</span>
              <input
                value={verifySecret}
                onChange={(event) => setVerifySecret(event.target.value)}
                spellCheck={false}
                autoComplete="off"
              />
            </label>

            <label className="verify-field">
              <span>x-signature header</span>
              <input
                value={verifySignature}
                onChange={(event) => setVerifySignature(event.target.value)}
                spellCheck={false}
                autoComplete="off"
                placeholder="64-character hex digest"
              />
            </label>

            <div className={`verify-result verify-result--${verification.status}`} aria-live="polite">
              {verification.status === "match" ? (
                <CheckCircle2 size={20} aria-hidden="true" />
              ) : verification.status === "mismatch" ? (
                <XCircle size={20} aria-hidden="true" />
              ) : (
                <AlertTriangle size={20} aria-hidden="true" />
              )}
              <div>
                <strong>
                  {verification.status === "match"
                    ? "Verified"
                    : verification.status === "mismatch"
                      ? "Mismatch"
                      : verification.status === "invalid"
                        ? "Invalid"
                        : "Waiting"}
                </strong>
                <p>{verification.message}</p>
              </div>
            </div>

            <pre className="verify-digest" aria-label="Computed signature">
              <code>{verifyExpectedSignature || "Computed HMAC will appear here"}</code>
            </pre>
          </div>
        </div>
      </section>

      <section className="contract-panel" aria-label="Payment webhook contract test generator">
        <div className="contract-panel__copy">
          <p className="eyebrow">Contract Test Generator</p>
          <h2>Turn the inspected webhook into a stable CI contract</h2>
          <p>
            Generate a Vitest contract from the current payload fields so future route edits fail
            before they break event names, object IDs, payment status mapping, customer linking, or
            idempotency key derivation.
          </p>
          <div className="review-actions">
            <button type="button" onClick={copyContractTest} title="Copy webhook contract report">
              {contractCopied ? <Check size={17} aria-hidden="true" /> : <Clipboard size={17} aria-hidden="true" />}
              {contractCopied ? "Copied" : "Copy report"}
            </button>
            <button type="button" onClick={downloadContractTest} title="Download webhook contract test">
              <Download size={17} aria-hidden="true" />
              Download test
            </button>
          </div>
        </div>

        <div className="contract-grid">
          <div className="contract-card contract-card--primary">
            <span>Contract identity</span>
            <strong>{payloadInsight.eventName}</strong>
            <p>
              {payloadInsight.objectType}:{payloadInsight.objectId}
            </p>
          </div>

          <div className="contract-card">
            <span>Asserted status</span>
            <strong>{payloadInsight.status}</strong>
            <p>{payloadInsight.amount}</p>
          </div>

          <div className="contract-card">
            <span>Stable idempotency key</span>
            <strong>{payloadInsight.idempotencyKey}</strong>
            <p>Derived before billing side effects.</p>
          </div>

          <pre className="contract-code" aria-label="Payment webhook contract test preview">
            <code>{contractTestSnippet}</code>
          </pre>
        </div>
      </section>

      <section className="diagnosis-panel" aria-label="Webhook signature mismatch debugger">
        <div className="diagnosis-panel__copy">
          <p className="eyebrow">Mismatch Debugger</p>
          <h2>Turn a failed signature check into a focused route fix</h2>
          <p>
            Pick the symptom closest to your failing webhook route. The debugger combines the
            browser verifier result with the selected framework to produce a prioritized raw-body,
            secret, header, middleware, or replay fix.
          </p>
          <div className="review-actions">
            <button type="button" onClick={copySignatureDiagnosis} title="Copy signature debug report">
              {diagnosisCopied ? <Check size={17} aria-hidden="true" /> : <Clipboard size={17} aria-hidden="true" />}
              {diagnosisCopied ? "Copied" : "Copy report"}
            </button>
            <button type="button" onClick={downloadSignatureDiagnosis} title="Download signature debug report">
              <Download size={17} aria-hidden="true" />
              Download .md
            </button>
          </div>
        </div>

        <div className="diagnosis-grid">
          <label className="diagnosis-select">
            <span>Failure symptom</span>
            <select
              value={signatureSymptom}
              onChange={(event) => setSignatureSymptom(event.target.value as SignatureSymptomId)}
            >
              {signatureSymptoms.map((symptom) => (
                <option key={symptom.id} value={symptom.id}>
                  {symptom.label}
                </option>
              ))}
            </select>
          </label>

          <div className="diagnosis-card diagnosis-card--summary">
            <span>{signatureDiagnosis.severity}</span>
            <strong>{signatureDiagnosis.summary}</strong>
            <p>{signatureSymptoms.find((symptom) => symptom.id === signatureSymptom)?.signal}</p>
          </div>

          <div className="diagnosis-card">
            <span>Primary fix</span>
            <p>{signatureDiagnosis.primaryFix}</p>
          </div>

          <div className="diagnosis-card">
            <span>{framework} route fix</span>
            <p>{signatureDiagnosis.frameworkFix}</p>
          </div>

          <ul className="diagnosis-checks" aria-label="Signature mismatch checks">
            {signatureDiagnosis.checks.map((check) => (
              <li key={check}>{check}</li>
            ))}
          </ul>

          <pre className="diagnosis-command" aria-label="Suggested signature regression test">
            <code>{signatureDiagnosis.testCommand}</code>
          </pre>
        </div>
      </section>

      <section className="idempotency-panel" aria-label="Webhook idempotency key builder">
        <div className="idempotency-panel__copy">
          <p className="eyebrow">Idempotency Key Builder</p>
          <h2>Build the stable key your webhook handler should store before side effects</h2>
          <p>
            Choose a provider, event name, object ID, and uniqueness scope. The builder outputs a
            normalized idempotency key, database constraint, handler guard, and replay rule.
          </p>
          <div className="review-actions">
            <button type="button" onClick={copyIdempotencyReport} title="Copy idempotency key report">
              {idempotencyCopied ? <Check size={17} aria-hidden="true" /> : <Clipboard size={17} aria-hidden="true" />}
              {idempotencyCopied ? "Copied" : "Copy report"}
            </button>
            <button type="button" onClick={downloadIdempotencyReport} title="Download idempotency key report">
              <Download size={17} aria-hidden="true" />
              Download .md
            </button>
          </div>
        </div>

        <div className="idempotency-grid">
          <div className="idempotency-form">
            <label>
              <span>Provider</span>
              <select
                value={idempotencyProvider}
                onChange={(event) => loadIdempotencyProviderDefaults(event.target.value as IdempotencyProviderId)}
              >
                {idempotencyProviders.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Event name</span>
              <input
                value={idempotencyEventName}
                onChange={(event) => setIdempotencyEventName(event.target.value)}
                spellCheck={false}
              />
            </label>

            <label>
              <span>Object ID</span>
              <input
                value={idempotencyObjectId}
                onChange={(event) => setIdempotencyObjectId(event.target.value)}
                spellCheck={false}
              />
            </label>

            <label>
              <span>Uniqueness scope</span>
              <select
                value={idempotencyScope}
                onChange={(event) => setIdempotencyScope(event.target.value as IdempotencyScopeId)}
              >
                {idempotencyScopes.map((scope) => (
                  <option key={scope.id} value={scope.id}>
                    {scope.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="idempotency-result">
            <span>Generated key</span>
            <strong>{idempotencyKey}</strong>
            <p>{idempotencyScopes.find((scope) => scope.id === idempotencyScope)?.note}</p>
          </div>

          <pre className="idempotency-code" aria-label="Idempotency handler guard preview">
            <code>{idempotencySnippet}</code>
          </pre>
        </div>
      </section>

      <section className="replay-panel" aria-label="Webhook duplicate replay simulator">
        <div className="replay-panel__copy">
          <p className="eyebrow">Duplicate Replay Simulator</p>
          <h2>Model what should happen when the same webhook is delivered three times</h2>
          <p>
            Payment providers retry events. Use the recommended idempotency key to process the first
            delivery and skip duplicates without repeating emails, license delivery, or entitlement writes.
          </p>
          <div className="review-actions">
            <button type="button" onClick={copyReplayTest} title="Copy duplicate replay test">
              {replayCopied ? <Check size={17} aria-hidden="true" /> : <Clipboard size={17} aria-hidden="true" />}
              {replayCopied ? "Copied" : "Copy test"}
            </button>
            <button type="button" onClick={downloadReplayTest} title="Download duplicate replay test">
              <Download size={17} aria-hidden="true" />
              Download test
            </button>
          </div>
        </div>

        <div className="replay-grid">
          <div className="replay-key">
            <span>Replay key</span>
            <strong>{payloadInsight.idempotencyKey}</strong>
          </div>

          <div className="replay-timeline" aria-label="Duplicate delivery attempts">
            {replayAttempts.map((attempt) => (
              <article
                className={`replay-attempt replay-attempt--${attempt.decision}`}
                key={`${attempt.attempt}-${attempt.status}`}
              >
                <div className="replay-attempt__index">
                  <Repeat2 size={16} aria-hidden="true" />
                  <span>Attempt {attempt.attempt}</span>
                </div>
                <div>
                  <strong>{attempt.status}</strong>
                  <p>{attempt.note}</p>
                </div>
              </article>
            ))}
          </div>

          <pre className="replay-code" aria-label="Duplicate replay test preview">
            <code>{replayTestSnippet}</code>
          </pre>
        </div>
      </section>

      <section className="entitlement-panel" aria-label="Payment webhook entitlement decision matrix">
        <div className="entitlement-panel__copy">
          <p className="eyebrow">Entitlement Matrix</p>
          <h2>Map billing events to the access change your app should make</h2>
          <p>
            Use this matrix before launch to separate paid grants, subscription renewals,
            cancellation schedules, failed payments, and unknown events. It gives every webhook
            event a handler decision, write model, customer message, and regression test.
          </p>
          <div className="review-actions">
            <button type="button" onClick={copyEntitlementMatrix} title="Copy entitlement matrix">
              {matrixCopied ? <Check size={17} aria-hidden="true" /> : <Clipboard size={17} aria-hidden="true" />}
              {matrixCopied ? "Copied" : "Copy matrix"}
            </button>
            <button type="button" onClick={downloadEntitlementMatrix} title="Download entitlement matrix">
              <Download size={17} aria-hidden="true" />
              Download .md
            </button>
          </div>
        </div>

        <div className="entitlement-table-wrap">
          <table className="entitlement-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>State</th>
                <th>Decision</th>
                <th>Write model</th>
                <th>Regression test</th>
              </tr>
            </thead>
            <tbody>
              {entitlementRows.map((row) => (
                <tr key={`${row.event}-${row.state}`}>
                  <td>{row.event}</td>
                  <td>{row.state}</td>
                  <td>
                    <strong>{row.decision}</strong>
                    <span>{row.customerMessage}</span>
                  </td>
                  <td>{row.writeModel}</td>
                  <td>{row.testCase}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="readiness-panel" aria-label="Billing webhook launch readiness scorecard">
        <div className="readiness-panel__copy">
          <p className="eyebrow">Launch Readiness</p>
          <h2>Score whether this billing route is safe enough for paid checkout traffic</h2>
          <p>
            Check the evidence you already have before launch. The scorecard turns signature,
            retry, entitlement, secret, smoke-test, review, and monitoring gaps into a compact
            release report.
          </p>
          <div className="review-actions">
            <button type="button" onClick={copyReadinessReport} title="Copy launch readiness report">
              {readinessCopied ? <Check size={17} aria-hidden="true" /> : <Clipboard size={17} aria-hidden="true" />}
              {readinessCopied ? "Copied" : "Copy report"}
            </button>
            <button type="button" onClick={downloadReadinessReport} title="Download launch readiness report">
              <Download size={17} aria-hidden="true" />
              Download .md
            </button>
          </div>
        </div>

        <div className="readiness-grid">
          <div className="readiness-score">
            <span>Readiness score</span>
            <strong>{readinessScore}/100</strong>
            <p>
              {currentReadinessLevel.label}: {currentReadinessLevel.summary}
            </p>
          </div>

          <div className="readiness-checklist" aria-label="Launch readiness checklist">
            {readinessItems.map((item) => {
              const checked = readinessSelected.includes(item.id);
              return (
                <label className={`readiness-item ${checked ? "readiness-item--checked" : ""}`} key={item.id}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleReadinessItem(item.id)}
                  />
                  <span>{item.area}</span>
                  <strong>{item.label}</strong>
                  <p>{checked ? item.evidence : item.risk}</p>
                  <em>{item.weight} pts</em>
                </label>
              );
            })}
          </div>
        </div>
      </section>

      <section className="cost-panel" aria-label="Webhook debugging cost calculator">
        <div className="cost-panel__copy">
          <p className="eyebrow">Launch Cost Calculator</p>
          <h2>Check whether a small webhook kit is cheaper than one debugging session</h2>
          <p>
            Estimate the engineering time normally spent on raw-body signatures, duplicate retries,
            idempotency, and release review before billing goes live.
          </p>
        </div>

        <div className="cost-grid">
          <div className="range-field">
            <div className="range-field__top">
              <span>Developer hourly rate</span>
              <input
                aria-label="Developer hourly rate"
                type="number"
                min="25"
                max="200"
                step="5"
                value={hourlyRate}
                onChange={(event) => setHourlyRate(clampNumber(Number(event.target.value), 25, 200))}
              />
            </div>
            <strong>{formatUsd(hourlyRate)}</strong>
            <input
              aria-label="Developer hourly rate slider"
              type="range"
              min="25"
              max="200"
              step="5"
              value={hourlyRate}
              onChange={(event) => setHourlyRate(Number(event.target.value))}
            />
          </div>

          <div className="range-field">
            <div className="range-field__top">
              <span>Webhook debug hours per launch</span>
              <input
                aria-label="Webhook debug hours per launch"
                type="number"
                min="1"
                max="16"
                step="0.5"
                value={debugHours}
                onChange={(event) => setDebugHours(clampNumber(Number(event.target.value), 1, 16))}
              />
            </div>
            <strong>{formatHours(debugHours)}</strong>
            <input
              aria-label="Webhook debug hours slider"
              type="range"
              min="1"
              max="16"
              step="0.5"
              value={debugHours}
              onChange={(event) => setDebugHours(Number(event.target.value))}
            />
          </div>

          <div className="range-field">
            <div className="range-field__top">
              <span>Billing launches or rewires per year</span>
              <input
                aria-label="Billing launches or rewires per year"
                type="number"
                min="1"
                max="8"
                step="1"
                value={billingLaunches}
                onChange={(event) => setBillingLaunches(clampNumber(Number(event.target.value), 1, 8))}
              />
            </div>
            <strong>{billingLaunches}</strong>
            <input
              aria-label="Billing launches slider"
              type="range"
              min="1"
              max="8"
              step="1"
              value={billingLaunches}
              onChange={(event) => setBillingLaunches(Number(event.target.value))}
            />
          </div>

          <div className="cost-result">
            <div className="cost-result__icon">
              <Calculator size={20} aria-hidden="true" />
            </div>
            <div>
              <span>Estimated avoidable debugging exposure</span>
              <strong>{formatUsd(annualDebugCost)}</strong>
              <p>
                CN¥69 is roughly US$9.70 at the launch reference price. At this rate, the kit breaks even
                after about {Math.max(1, Math.round(breakEvenMinutes))} minutes and is a {estimatedMultiple.toFixed(1)}x
                reference multiple against the estimated debugging exposure.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="review-panel" aria-label="Webhook review report">
        <div className="review-panel__copy">
          <p className="eyebrow">Review Report</p>
          <h2>Turn the current webhook check into a PR-ready release note</h2>
          <p>
            Copy a compact Markdown summary of the route, signature gate, trusted fields,
            idempotency key, handler decision, and retry safety checks.
          </p>
          <div className="review-actions">
            <button type="button" onClick={copyReviewReport} title="Copy webhook review report">
              {reportCopied ? <Check size={17} aria-hidden="true" /> : <Clipboard size={17} aria-hidden="true" />}
              {reportCopied ? "Copied" : "Copy report"}
            </button>
            <button type="button" onClick={downloadReviewReport} title="Download webhook review report">
              <Download size={17} aria-hidden="true" />
              Download .md
            </button>
          </div>
        </div>

        <pre className="review-preview" aria-label="Webhook review report preview">
          <code>{reviewReport}</code>
        </pre>
      </section>

      <section className="evidence-panel" aria-label="Pro Kit contents">
        <div className="evidence-panel__copy">
          <p className="eyebrow">Pro Kit Contents</p>
          <h2>Copy-ready billing webhook assets, not another blank starter repo</h2>
          <p>
            The paid pack is organized around the failure modes that usually break SaaS billing launches:
            signature verification, duplicate retries, provider field mapping, PR review reports, and release-time CI checks.
          </p>
          <div className="signal-row">
            {integrationSignals.map((signal) => (
              <span key={signal}>{signal}</span>
            ))}
          </div>
          <a className="inline-cta" href="pro-kit.html">
            View the Pro Kit package preview
          </a>
          <a className="inline-cta" href="free-sample.html">
            Download the free sample pack
          </a>
          <a className="inline-cta" href="delivery-refund-support.html">
            Read delivery, refund, and support details
          </a>
          <a className="inline-cta" href="billing-webhook-launch-evidence-pack.html">
            Review the launch evidence pack
          </a>
          <a className="inline-cta" href="billing-webhook-kit-pro-sample-report.html">
            Inspect the Pro sample report
          </a>
          <a className="inline-cta" href="tools/lemon-squeezy-production-checkout-readiness-report.html">
            Generate production checkout readiness
          </a>
          <a className="inline-cta" href="tools/lemon-squeezy-paypal-live-checkout-report.html">
            Generate PayPal live checkout evidence
          </a>
          <a className="inline-cta" href="status.html">
            Verify checkout and package status
          </a>
          <a className="inline-cta" href="tools/">
            Browse standalone webhook tools
          </a>
          <a className="inline-cta" href="troubleshooting.html">
            Pick a Lemon Squeezy troubleshooting path
          </a>
          <a className="inline-cta" href="tools/lemon-squeezy-signature-verifier.html">
            Open standalone signature verifier
          </a>
          <a className="inline-cta" href="tools/lemon-squeezy-webhook-payload-generator.html">
            Generate standalone webhook payloads
          </a>
          <a className="inline-cta" href="tools/webhook-idempotency-key-generator.html">
            Generate standalone idempotency keys
          </a>
          <a className="inline-cta" href="tools/stripe-webhook-fixture-generator.html">
            Generate standalone Stripe fixtures
          </a>
          <a className="inline-cta" href="tools/webhook-replay-curl-generator.html">
            Generate standalone replay cURL commands
          </a>
          <a className="inline-cta" href="tools/nextjs-webhook-handler-generator.html">
            Generate standalone Next.js handlers
          </a>
          <a className="inline-cta" href="tools/nextjs-lemon-squeezy-raw-body-audit.html">
            Audit Next.js raw-body signature safety
          </a>
          <a className="inline-cta" href="tools/vercel-lemon-squeezy-webhook-debugger.html">
            Debug Vercel Lemon Squeezy webhooks
          </a>
          <a className="inline-cta" href="guides/nextjs-webhook-405-lemon-squeezy.html">
            Fix Next.js 405 webhook routes
          </a>
          <a className="inline-cta" href="tools/billing-webhook-launch-readiness-scorecard.html">
            Score launch readiness
          </a>
          <a className="inline-cta" href="tools/billing-webhook-pro-fit-checker.html">
            Check Pro Kit fit
          </a>
        </div>
        <pre className="file-tree" aria-label="Example Pro Kit file tree">
          <code>{proArtifacts.join("\n")}</code>
        </pre>
      </section>

      <section className="guide-panel" aria-label="Billing webhook integration guides">
        <div>
          <p className="eyebrow">Webhook Guides</p>
          <h2>Focused references for search-heavy billing integration jobs</h2>
          <a className="inline-cta" href="guides/">
            Browse all payment webhook guides
          </a>
        </div>
        <div className="guide-grid">
          {guideLinks.map((guide) => (
            <a key={guide.href} href={guide.href}>
              {guide.label}
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
