import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
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
  { href: "guides/lemon-squeezy-webhook-test.html", label: "Test Lemon Squeezy webhooks locally" },
  { href: "guides/lemon-squeezy-webhook-signature.html", label: "Verify Lemon Squeezy signatures" },
  { href: "guides/nextjs-lemon-squeezy-webhook-handler.html", label: "Next.js Lemon Squeezy handler" },
  { href: "guides/hono-lemon-squeezy-webhook-handler.html", label: "Hono Lemon Squeezy handler" },
  { href: "guides/stripe-webhook-fixture-generator.html", label: "Stripe webhook fixtures" },
  { href: "guides/paddle-webhook-test-payload.html", label: "Paddle webhook payloads" },
  { href: "guides/webhook-replay-curl-command.html", label: "Replay webhooks with cURL" },
  { href: "guides/payment-webhook-ci-tests.html", label: "Payment webhook CI tests" },
  { href: "guides/lemon-squeezy-license-key-webhook.html", label: "License key webhook tests" },
  { href: "guides/subscription-payment-success-webhook.html", label: "Subscription payment success" },
  { href: "guides/polar-webhook-fixtures.html", label: "Polar webhook fixtures" },
  { href: "guides/webhook-idempotency-checklist.html", label: "Webhook idempotency checklist" },
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
  "src/handlers/next-app-router.ts",
  "src/handlers/cloudflare-worker.ts",
  "tests/lemon-signature.test.ts",
  ".github/workflows/webhook-checks.yml"
];

const integrationSignals = [
  "Raw-body HMAC checks",
  "Idempotent retry fixtures",
  "Provider mapping examples",
  "CI-ready test command"
];

const defaultEndpoint = "https://yourapp.com/api/webhooks/lemonsqueezy";
const productUrl = "https://qihaze123.github.io/billing-webhook-kit/";

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
            <li>Vitest signature verification suite</li>
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

          <div className="trust-row">
            <span>Browser-only generator</span>
            <span>No account required</span>
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
            signature verification, duplicate retries, provider field mapping, and release-time CI checks.
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
        </div>
        <pre className="file-tree" aria-label="Example Pro Kit file tree">
          <code>{proArtifacts.join("\n")}</code>
        </pre>
      </section>

      <section className="guide-panel" aria-label="Billing webhook integration guides">
        <div>
          <p className="eyebrow">Webhook Guides</p>
          <h2>Focused references for search-heavy billing integration jobs</h2>
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
