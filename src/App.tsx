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

const defaultEndpoint = "https://yourapp.com/api/webhooks/lemonsqueezy";

export function App() {
  const [eventId, setEventId] = useState<EventId>("order_created");
  const [framework, setFramework] = useState<FrameworkId>("next");
  const [activeTab, setActiveTab] = useState<OutputTab>("payload");
  const [secret, setSecret] = useState("test_webhook_secret");
  const [endpoint, setEndpoint] = useState(defaultEndpoint);
  const [signature, setSignature] = useState("");
  const [copied, setCopied] = useState(false);

  const checkoutUrl = import.meta.env.VITE_LEMON_CHECKOUT_URL || "";
  const selectedEvent = lemonEvents.find((event) => event.id === eventId) ?? lemonEvents[0];
  const payload = useMemo(() => buildLemonPayload(eventId), [eventId]);
  const payloadJson = useMemo(() => asJson(payload), [payload]);

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
          <a className="ghost-link" href="#pro-kit">
            Pro Kit
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
              Checkout pending
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
            <strong>$19</strong>
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
              Checkout link pending
            </button>
          )}

          <div className="trust-row">
            <span>Browser-only generator</span>
            <span>No account required</span>
          </div>
        </aside>
      </section>
    </main>
  );
}

