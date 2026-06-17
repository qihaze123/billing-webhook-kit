import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Clipboard,
  Code2,
  Download,
  ExternalLink,
  FileJson,
  KeyRound,
  PackageCheck,
  Play,
  ShieldCheck,
  Terminal
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
  { href: "guides/saas-billing-webhook-test-plan.html", label: "SaaS billing webhook test plan" }
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

type CheckoutConfig = {
  checkoutUrl?: string;
};

export function App() {
  const [eventId, setEventId] = useState<EventId>("order_created");
  const [framework, setFramework] = useState<FrameworkId>("next");
  const [activeTab, setActiveTab] = useState<OutputTab>("payload");
  const [secret, setSecret] = useState("test_webhook_secret");
  const [endpoint, setEndpoint] = useState(defaultEndpoint);
  const [signature, setSignature] = useState("");
  const [copied, setCopied] = useState(false);
  const [runtimeCheckoutUrl, setRuntimeCheckoutUrl] = useState("");

  const checkoutUrl = runtimeCheckoutUrl || import.meta.env.VITE_LEMON_CHECKOUT_URL || "";
  const selectedEvent = lemonEvents.find((event) => event.id === eventId) ?? lemonEvents[0];
  const payload = useMemo(() => buildLemonPayload(eventId), [eventId]);
  const payloadJson = useMemo(() => asJson(payload), [payload]);

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

  async function copyCurrentOutput() {
    await navigator.clipboard.writeText(currentOutput);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  function downloadCurrentOutput() {
    const extension = activeTab === "payload" ? "json" : "txt";
    downloadText(`billing-webhook-kit-${eventId}-${activeTab}.${extension}`, currentOutput);
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Payment Webhook Lab</p>
          <h1>BillingWebhookKit</h1>
        </div>
        <div className="topbar__actions">
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

          <div className="trust-row">
            <span>Browser-only generator</span>
            <span>No account required</span>
          </div>
        </aside>
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
