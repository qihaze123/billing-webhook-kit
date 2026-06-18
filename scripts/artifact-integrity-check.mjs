import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const publicDir = join(root, "public");
const manifestPath = join(publicDir, "pro-kit-manifest.json");
const freeSampleZipPath = join(publicDir, "billing-webhook-kit-free-sample.zip");
const freeSamplePath = join(publicDir, "free-sample.html");
const proKitPath = join(publicDir, "pro-kit.html");
const deliverySupportPath = join(publicDir, "delivery-refund-support.html");
const digitalDownloadGuidePath = join(publicDir, "guides", "lemon-squeezy-digital-download-fulfillment.html");
const nextjs405GuidePath = join(publicDir, "guides", "nextjs-webhook-405-lemon-squeezy.html");
const webhook500GuidePath = join(publicDir, "guides", "lemon-squeezy-webhook-500-vercel-nextjs.html");
const retryIdempotencyGuidePath = join(publicDir, "guides", "lemon-squeezy-webhook-retry-idempotency.html");
const alternativesGuidePath = join(publicDir, "guides", "payment-webhook-test-tool-alternatives.html");
const statusPath = join(publicDir, "status.html");
const googleIndexingPriorityPath = join(publicDir, "google-indexing-priority.html");
const troubleshootingPath = join(publicDir, "troubleshooting.html");
const toolIndexPath = join(publicDir, "tools", "index.html");
const signatureVerifierPath = join(publicDir, "tools", "lemon-squeezy-signature-verifier.html");
const payloadGeneratorPath = join(publicDir, "tools", "lemon-squeezy-webhook-payload-generator.html");
const fulfillmentChecklistPath = join(publicDir, "tools", "lemon-squeezy-fulfillment-checklist-generator.html");
const deliveryEmailTemplatesPath = join(publicDir, "tools", "lemon-squeezy-delivery-email-template-generator.html");
const eventCoverageMatrixPath = join(publicDir, "tools", "lemon-squeezy-webhook-event-coverage-matrix.html");
const paypalLiveCheckoutReportPath = join(publicDir, "tools", "lemon-squeezy-paypal-live-checkout-report.html");
const vercelLemonSqueezyDebuggerPath = join(publicDir, "tools", "vercel-lemon-squeezy-webhook-debugger.html");
const paymentWebhookTestPlanPath = join(publicDir, "tools", "payment-webhook-test-plan-generator.html");
const checkoutPath = join(publicDir, "checkout.json");
const expectedFreeSampleSha256 = "8230974cb0ffd457346201989ae8800378c700fb31144fa5330fba7c2fb5094b";

function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function walkFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(dir, entry.name);
    return entry.isDirectory() ? walkFiles(fullPath) : [fullPath];
  });
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

const issues = [];

if (!existsSync(manifestPath)) issues.push("Missing public/pro-kit-manifest.json.");
if (!existsSync(freeSampleZipPath)) issues.push("Missing public/billing-webhook-kit-free-sample.zip.");
if (!existsSync(freeSamplePath)) issues.push("Missing public/free-sample.html.");
if (!existsSync(proKitPath)) issues.push("Missing public/pro-kit.html.");
if (!existsSync(deliverySupportPath)) issues.push("Missing public/delivery-refund-support.html.");
if (!existsSync(digitalDownloadGuidePath)) {
  issues.push("Missing public/guides/lemon-squeezy-digital-download-fulfillment.html.");
}
if (!existsSync(nextjs405GuidePath)) {
  issues.push("Missing public/guides/nextjs-webhook-405-lemon-squeezy.html.");
}
if (!existsSync(webhook500GuidePath)) {
  issues.push("Missing public/guides/lemon-squeezy-webhook-500-vercel-nextjs.html.");
}
if (!existsSync(retryIdempotencyGuidePath)) {
  issues.push("Missing public/guides/lemon-squeezy-webhook-retry-idempotency.html.");
}
if (!existsSync(alternativesGuidePath)) {
  issues.push("Missing public/guides/payment-webhook-test-tool-alternatives.html.");
}
if (!existsSync(statusPath)) issues.push("Missing public/status.html.");
if (!existsSync(googleIndexingPriorityPath)) issues.push("Missing public/google-indexing-priority.html.");
if (!existsSync(troubleshootingPath)) issues.push("Missing public/troubleshooting.html.");
if (!existsSync(toolIndexPath)) issues.push("Missing public/tools/index.html.");
if (!existsSync(signatureVerifierPath)) issues.push("Missing public/tools/lemon-squeezy-signature-verifier.html.");
if (!existsSync(payloadGeneratorPath)) issues.push("Missing public/tools/lemon-squeezy-webhook-payload-generator.html.");
if (!existsSync(fulfillmentChecklistPath)) {
  issues.push("Missing public/tools/lemon-squeezy-fulfillment-checklist-generator.html.");
}
if (!existsSync(deliveryEmailTemplatesPath)) {
  issues.push("Missing public/tools/lemon-squeezy-delivery-email-template-generator.html.");
}
if (!existsSync(eventCoverageMatrixPath)) {
  issues.push("Missing public/tools/lemon-squeezy-webhook-event-coverage-matrix.html.");
}
if (!existsSync(paypalLiveCheckoutReportPath)) {
  issues.push("Missing public/tools/lemon-squeezy-paypal-live-checkout-report.html.");
}
if (!existsSync(vercelLemonSqueezyDebuggerPath)) {
  issues.push("Missing public/tools/vercel-lemon-squeezy-webhook-debugger.html.");
}
if (!existsSync(paymentWebhookTestPlanPath)) {
  issues.push("Missing public/tools/payment-webhook-test-plan-generator.html.");
}
if (!existsSync(checkoutPath)) issues.push("Missing public/checkout.json.");

const manifest = existsSync(manifestPath) ? readJson(manifestPath) : null;
const checkout = existsSync(checkoutPath) ? readJson(checkoutPath) : null;
const freeSampleHtml = existsSync(freeSamplePath) ? readFileSync(freeSamplePath, "utf8") : "";
const proKitHtml = existsSync(proKitPath) ? readFileSync(proKitPath, "utf8") : "";
const deliverySupportHtml = existsSync(deliverySupportPath) ? readFileSync(deliverySupportPath, "utf8") : "";
const digitalDownloadGuideHtml = existsSync(digitalDownloadGuidePath)
  ? readFileSync(digitalDownloadGuidePath, "utf8")
  : "";
const nextjs405GuideHtml = existsSync(nextjs405GuidePath) ? readFileSync(nextjs405GuidePath, "utf8") : "";
const webhook500GuideHtml = existsSync(webhook500GuidePath) ? readFileSync(webhook500GuidePath, "utf8") : "";
const retryIdempotencyGuideHtml = existsSync(retryIdempotencyGuidePath)
  ? readFileSync(retryIdempotencyGuidePath, "utf8")
  : "";
const alternativesGuideHtml = existsSync(alternativesGuidePath) ? readFileSync(alternativesGuidePath, "utf8") : "";
const statusHtml = existsSync(statusPath) ? readFileSync(statusPath, "utf8") : "";
const googleIndexingPriorityHtml = existsSync(googleIndexingPriorityPath)
  ? readFileSync(googleIndexingPriorityPath, "utf8")
  : "";
const troubleshootingHtml = existsSync(troubleshootingPath) ? readFileSync(troubleshootingPath, "utf8") : "";
const toolIndexHtml = existsSync(toolIndexPath) ? readFileSync(toolIndexPath, "utf8") : "";
const signatureVerifierHtml = existsSync(signatureVerifierPath) ? readFileSync(signatureVerifierPath, "utf8") : "";
const payloadGeneratorHtml = existsSync(payloadGeneratorPath) ? readFileSync(payloadGeneratorPath, "utf8") : "";
const fulfillmentChecklistHtml = existsSync(fulfillmentChecklistPath) ? readFileSync(fulfillmentChecklistPath, "utf8") : "";
const deliveryEmailTemplatesHtml = existsSync(deliveryEmailTemplatesPath)
  ? readFileSync(deliveryEmailTemplatesPath, "utf8")
  : "";
const eventCoverageMatrixHtml = existsSync(eventCoverageMatrixPath)
  ? readFileSync(eventCoverageMatrixPath, "utf8")
  : "";
const paypalLiveCheckoutReportHtml = existsSync(paypalLiveCheckoutReportPath)
  ? readFileSync(paypalLiveCheckoutReportPath, "utf8")
  : "";
const vercelLemonSqueezyDebuggerHtml = existsSync(vercelLemonSqueezyDebuggerPath)
  ? readFileSync(vercelLemonSqueezyDebuggerPath, "utf8")
  : "";
const paymentWebhookTestPlanHtml = existsSync(paymentWebhookTestPlanPath)
  ? readFileSync(paymentWebhookTestPlanPath, "utf8")
  : "";
const publicZipFiles = existsSync(publicDir)
  ? walkFiles(publicDir).filter((path) => path.toLowerCase().endsWith(".zip"))
  : [];
const paidZipLeaks = publicZipFiles.filter((path) => /billingwebhookkit-pro|pro[-_ ]?0\.1\.0/i.test(path));
const freeSampleSha256 = existsSync(freeSampleZipPath) ? sha256(freeSampleZipPath) : null;

if (paidZipLeaks.length) {
  issues.push(`Paid Pro Kit archive appears in public assets: ${paidZipLeaks.join(", ")}`);
}

if (freeSampleSha256 !== expectedFreeSampleSha256) {
  issues.push("Free sample ZIP SHA-256 does not match the expected public release digest.");
}

if (manifest) {
  if (manifest.name !== "BillingWebhookKit Pro") issues.push("Pro Kit manifest name changed.");
  if (manifest.price?.currency !== "CNY") issues.push("Pro Kit manifest currency is not CNY.");
  if (manifest.price?.minorUnits !== 6900) issues.push("Pro Kit manifest price is not 6900 minor units.");
  if (manifest.delivery?.publicDownload !== false) issues.push("Pro Kit manifest publicDownload must be false.");
  if (!/^[a-f0-9]{64}$/.test(String(manifest.delivery?.sha256 || ""))) {
    issues.push("Pro Kit manifest delivery SHA-256 is missing or malformed.");
  }
  if (manifest.delivery?.fileName !== "BillingWebhookKit-Pro-0.1.0.zip") {
    issues.push("Pro Kit manifest delivery file name changed.");
  }
  if (manifest.delivery?.bytes !== 19069) issues.push("Pro Kit manifest byte size changed unexpectedly.");
  if (manifest.verification?.tests !== 12) issues.push("Pro Kit manifest test count is not 12.");
  if (manifest.contents?.fileCount !== 29) issues.push("Pro Kit manifest file count is not 29.");
  if (manifest.safety?.usesFakeProviderData !== true) issues.push("Manifest must declare fake provider data.");
  if (manifest.safety?.includesProductionSecrets !== false) issues.push("Manifest must declare no production secrets.");
  if (manifest.safety?.callsPaidApis !== false) issues.push("Manifest must declare no paid API calls.");
  if (manifest.safety?.checkoutCurrencyPolicy !== "inherit_store_or_variant_currency") {
    issues.push("Manifest checkout currency policy changed.");
  }
}

if (checkout) {
  const checkoutWaiting =
    checkout.checkoutUrl === "" &&
    checkout.environment === "production" &&
    checkout.status === "awaiting_live_key" &&
    checkout.priceCents === 6900 &&
    checkout.currencyPolicy === "inherit_store_or_variant_currency";
  const checkoutReady =
    Boolean(checkout.checkoutUrl) &&
    checkout.environment === "production" &&
    checkout.status === "ready" &&
    checkout.priceCents === 6900 &&
    checkout.currencyPolicy === "inherit_store_or_variant_currency";
  if (!checkoutWaiting && !checkoutReady) {
    issues.push("Public checkout config is neither safe waiting mode nor production ready mode.");
  }
}

if (!freeSampleHtml.includes("billing-webhook-kit-free-sample.zip")) {
  issues.push("Free sample page does not link the public sample ZIP.");
}
if (
  !freeSampleHtml.includes("pro-kit.html") ||
  !freeSampleHtml.includes("pro-kit-manifest.json") ||
  !freeSampleHtml.includes("delivery-refund-support.html")
) {
  issues.push("Free sample page does not link the Pro Kit preview, manifest, and delivery policy.");
}
if (
  !freeSampleHtml.includes("lemon-squeezy-checkout-smoke-test.html") ||
  !freeSampleHtml.includes("lemon-squeezy-paypal-checkout-webhook-test.html") ||
  !freeSampleHtml.includes("lemon-squeezy-checkout-404-custom-price-currency.html") ||
  !freeSampleHtml.includes("lemon-squeezy-checkout-smoke-test-report.html")
) {
  issues.push("Free sample page does not expose checkout launch gate upgrade links.");
}
if (!proKitHtml.includes("pro-kit-manifest.json")) {
  issues.push("Pro Kit page does not link the public manifest.");
}
if (!proKitHtml.includes("delivery-refund-support.html") || !proKitHtml.includes("support and refund")) {
  issues.push("Pro Kit page does not link delivery, support, or refund policy details.");
}
if (!proKitHtml.includes("29443d9d91e918896049b2c5807e8d2342f0204675bca7eb6a5c2c824f599ad8")) {
  issues.push("Pro Kit page does not expose the public ZIP verification hash.");
}
if (
  !deliverySupportHtml.includes("Delivery, refund, and support details before checkout.") ||
  !deliverySupportHtml.includes("Private ZIP after live checkout") ||
  !deliverySupportHtml.includes("Public manifest and SHA-256") ||
  !deliverySupportHtml.includes("Refund Triggers") ||
  !deliverySupportHtml.includes("No live secrets or customer data in public issues") ||
  !deliverySupportHtml.includes("pro-kit.html") ||
  !deliverySupportHtml.includes("free-sample.html") ||
  !deliverySupportHtml.includes("status.html")
) {
  issues.push("Delivery support page is missing buyer assurance, verification, refund, safety, or conversion links.");
}
if (
  !digitalDownloadGuideHtml.includes("Deliver a digital download after Lemon Squeezy checkout") ||
  !digitalDownloadGuideHtml.includes("private ZIP") ||
  !digitalDownloadGuideHtml.includes("x-signature") ||
  !digitalDownloadGuideHtml.includes("idempotency") ||
  !digitalDownloadGuideHtml.includes("delivery-refund-support.html") ||
  !digitalDownloadGuideHtml.includes("pro-kit.html") ||
  !digitalDownloadGuideHtml.includes("free-sample.html")
) {
  issues.push("Digital download fulfillment guide is missing private delivery, signature, idempotency, policy, or conversion links.");
}
if (
  !nextjs405GuideHtml.includes("Fix Next.js 405 for Lemon Squeezy Webhooks") ||
  !nextjs405GuideHtml.includes("Method Not Allowed") ||
  !nextjs405GuideHtml.includes("export async function POST") ||
  !nextjs405GuideHtml.includes("request.text()") ||
  !nextjs405GuideHtml.includes("curl -i -X POST") ||
  !nextjs405GuideHtml.includes("x-signature") ||
  !nextjs405GuideHtml.includes("duplicate replay") ||
  !nextjs405GuideHtml.includes("vercel-lemon-squeezy-webhook-debugger.html") ||
  !nextjs405GuideHtml.includes("pro-kit.html") ||
  !nextjs405GuideHtml.includes("Never paste Lemon Squeezy API keys")
) {
  issues.push("Next.js 405 guide is missing method, POST export, raw-body, cURL, replay, safety, or conversion links.");
}
if (
  !webhook500GuideHtml.includes("Fix Lemon Squeezy Webhook 500 on Vercel and Next.js") ||
  !webhook500GuideHtml.includes("missing env vars") ||
  !webhook500GuideHtml.includes("timingSafeEqual") ||
  !webhook500GuideHtml.includes("request.text()") ||
  !webhook500GuideHtml.includes("Retryable fulfillment failure") ||
  !webhook500GuideHtml.includes("duplicate replay") ||
  !webhook500GuideHtml.includes("vercel-lemon-squeezy-webhook-debugger.html") ||
  !webhook500GuideHtml.includes("lemon-squeezy-production-checkout-readiness-report.html") ||
  !webhook500GuideHtml.includes("pro-kit.html") ||
  !webhook500GuideHtml.includes("Never paste Lemon Squeezy API keys")
) {
  issues.push("Webhook 500 guide is missing env, timingSafeEqual, raw-body, retry, replay, safety, or conversion links.");
}
if (
  !retryIdempotencyGuideHtml.includes("Lemon Squeezy Webhook Retry and Idempotency Guide") ||
  !retryIdempotencyGuideHtml.includes("Duplicate webhook delivery") ||
  !retryIdempotencyGuideHtml.includes("lemonsqueezy:order_created:order_id") ||
  !retryIdempotencyGuideHtml.includes("Return 2xx for safe duplicates") ||
  !retryIdempotencyGuideHtml.includes("Return 500 only for retryable fulfillment") ||
  !retryIdempotencyGuideHtml.includes("webhook-idempotency-key-generator.html") ||
  !retryIdempotencyGuideHtml.includes("lemon-squeezy-production-checkout-readiness-report.html") ||
  !retryIdempotencyGuideHtml.includes("pro-kit.html") ||
  !retryIdempotencyGuideHtml.includes("Never paste Lemon Squeezy API keys")
) {
  issues.push("Retry idempotency guide is missing duplicate delivery, process-once, status-code, conversion, or safety copy.");
}
if (
  !alternativesGuideHtml.includes("Payment Webhook Test Tool Alternatives") ||
  !alternativesGuideHtml.includes("webhook inboxes") ||
  !alternativesGuideHtml.includes("Provider CLIs") ||
  !alternativesGuideHtml.includes("Manual JSON fixtures") ||
  !alternativesGuideHtml.includes("BillingWebhookKit free path") ||
  !alternativesGuideHtml.includes("BillingWebhookKit Pro") ||
  !alternativesGuideHtml.includes("CN¥69") ||
  !alternativesGuideHtml.includes("billing-webhook-kit-pricing-roi.html") ||
  !alternativesGuideHtml.includes("pro-kit.html")
) {
  issues.push("Alternatives guide is missing comparison, provider-tooling, free-path, Pro Kit, price, or conversion copy.");
}
if (
  !proKitHtml.includes("Checkout Launch Gates") ||
  !proKitHtml.includes("lemon-squeezy-checkout-smoke-test.html") ||
  !proKitHtml.includes("lemon-squeezy-paypal-checkout-webhook-test.html") ||
  !proKitHtml.includes("lemon-squeezy-checkout-404-custom-price-currency.html") ||
  !proKitHtml.includes("lemon-squeezy-checkout-smoke-test-report.html")
) {
  issues.push("Pro Kit page does not expose checkout launch gate conversion links.");
}
if (
  !statusHtml.includes("pro-kit-manifest.json") ||
  !statusHtml.includes("delivery-refund-support.html") ||
  !statusHtml.includes("8230974cb0ffd457346201989ae8800378c700fb31144fa5330fba7c2fb5094b") ||
  !statusHtml.includes("29443d9d91e918896049b2c5807e8d2342f0204675bca7eb6a5c2c824f599ad8") ||
  !statusHtml.includes("Awaiting live key")
) {
  issues.push("Status page does not expose manifest, delivery policy, sample hash, Pro Kit hash, and checkout waiting state.");
}
if (
  !googleIndexingPriorityHtml.includes("Google indexing priority queue") ||
  !googleIndexingPriorityHtml.includes("lemon squeezy webhook test generator") ||
  !googleIndexingPriorityHtml.includes("lemon-squeezy-webhook-payload-generator.html") ||
  !googleIndexingPriorityHtml.includes("lemon-squeezy-signature-verifier.html") ||
  !googleIndexingPriorityHtml.includes("lemon-squeezy-checkout-404-custom-price-currency.html") ||
  !googleIndexingPriorityHtml.includes("search-console-sitemap-submission.html") ||
  !googleIndexingPriorityHtml.includes("owner-only actions")
) {
  issues.push("Google indexing priority page is missing search intent copy, priority links, handoff links, or owner-only boundary copy.");
}
if (
  !toolIndexHtml.includes("lemon-squeezy-webhook-payload-generator.html") ||
  !toolIndexHtml.includes("lemon-squeezy-signature-verifier.html") ||
  !toolIndexHtml.includes("Checkout and fulfillment launch decision tools") ||
  !toolIndexHtml.includes("Launch lane") ||
  !toolIndexHtml.includes("lemon-squeezy-checkout-smoke-test-report.html") ||
  !toolIndexHtml.includes("lemon-squeezy-paypal-live-checkout-report.html") ||
  !toolIndexHtml.includes("lemon-squeezy-production-checkout-readiness-report.html") ||
  !toolIndexHtml.includes("lemon-squeezy-fulfillment-checklist-generator.html") ||
  !toolIndexHtml.includes("lemon-squeezy-delivery-email-template-generator.html") ||
  !toolIndexHtml.includes("lemon-squeezy-webhook-event-coverage-matrix.html") ||
  !toolIndexHtml.includes("vercel-lemon-squeezy-webhook-debugger.html") ||
  !toolIndexHtml.includes("payment-webhook-test-plan-generator.html") ||
  !toolIndexHtml.includes("billing-webhook-launch-readiness-scorecard.html") ||
  !toolIndexHtml.includes("billing-webhook-debug-cost-calculator.html") ||
  !toolIndexHtml.includes("nextjs-lemon-squeezy-raw-body-audit.html") ||
  !toolIndexHtml.includes("free-sample.html") ||
  !toolIndexHtml.includes("pro-kit.html") ||
  !toolIndexHtml.includes("Browser-only")
) {
  issues.push("Tool index is missing launch-lane links, standalone tool links, conversion links, or browser-only safety copy.");
}
if (
  !troubleshootingHtml.includes("Lemon Squeezy Webhook Troubleshooting Hub") ||
  !troubleshootingHtml.includes("Lemon Squeezy webhook not firing after checkout") ||
  !troubleshootingHtml.includes("Lemon Squeezy webhook Vercel 404") ||
  !troubleshootingHtml.includes("Next.js webhook 405") ||
  !troubleshootingHtml.includes("Lemon Squeezy x-signature invalid") ||
  !troubleshootingHtml.includes("lemon-squeezy-checkout-404-custom-price-currency.html") ||
  !troubleshootingHtml.includes("vercel-lemon-squeezy-webhook-debugger.html") ||
  !troubleshootingHtml.includes("nextjs-lemon-squeezy-raw-body-audit.html") ||
  !troubleshootingHtml.includes("lemon-squeezy-production-checkout-readiness-report.html") ||
  !troubleshootingHtml.includes("No API key") && !troubleshootingHtml.includes("No API key, webhook secret")
) {
  issues.push("Troubleshooting hub is missing symptom copy, target links, or browser-only safety copy.");
}
if (
  !signatureVerifierHtml.includes("crypto.subtle") ||
  !signatureVerifierHtml.includes("hmacSha256Hex") ||
  !signatureVerifierHtml.includes("free-sample.html") ||
  !signatureVerifierHtml.includes("pro-kit.html") ||
  !signatureVerifierHtml.includes("No backend") && !signatureVerifierHtml.includes("never leaves the browser")
) {
  issues.push("Standalone signature verifier is missing local HMAC logic, conversion links, or browser-only copy.");
}
if (
  !payloadGeneratorHtml.includes("buildPayload") ||
  !payloadGeneratorHtml.includes("buildCurl") ||
  !payloadGeneratorHtml.includes("crypto.subtle") ||
  !payloadGeneratorHtml.includes("free-sample.html") ||
  !payloadGeneratorHtml.includes("pro-kit.html") ||
  (!payloadGeneratorHtml.includes("No backend") && !payloadGeneratorHtml.includes("no provider API is called"))
) {
  issues.push("Standalone payload generator is missing payload logic, cURL logic, local HMAC logic, conversion links, or browser-only copy.");
}
if (
  !fulfillmentChecklistHtml.includes("Lemon Squeezy fulfillment checklist generator") ||
  !fulfillmentChecklistHtml.includes("buildFulfillmentReport") ||
  !fulfillmentChecklistHtml.includes("private ZIP") ||
  !fulfillmentChecklistHtml.includes("x-signature") ||
  !fulfillmentChecklistHtml.includes("idempotency") ||
  !fulfillmentChecklistHtml.includes("checksum") ||
  !fulfillmentChecklistHtml.includes("pro-kit.html") ||
  !fulfillmentChecklistHtml.includes("free-sample.html") ||
  !fulfillmentChecklistHtml.includes("delivery-refund-support.html")
) {
  issues.push("Standalone fulfillment checklist generator is missing report logic, delivery safety copy, or conversion links.");
}
if (
  !deliveryEmailTemplatesHtml.includes("Lemon Squeezy delivery email template generator") ||
  !deliveryEmailTemplatesHtml.includes("buildDeliveryEmailTemplates") ||
  !deliveryEmailTemplatesHtml.includes("private ZIP") ||
  !deliveryEmailTemplatesHtml.includes("checksum") ||
  !deliveryEmailTemplatesHtml.includes("support policy") ||
  !deliveryEmailTemplatesHtml.includes("refund") ||
  !deliveryEmailTemplatesHtml.includes("pro-kit.html") ||
  !deliveryEmailTemplatesHtml.includes("free-sample.html") ||
  !deliveryEmailTemplatesHtml.includes("lemon-squeezy-fulfillment-checklist-generator.html") ||
  !deliveryEmailTemplatesHtml.includes("delivery-refund-support.html")
) {
  issues.push("Standalone delivery email template generator is missing template logic, delivery safety copy, or conversion links.");
}
if (
  !paypalLiveCheckoutReportHtml.includes("Lemon Squeezy PayPal live checkout report") ||
  !paypalLiveCheckoutReportHtml.includes("buildPayPalLiveCheckoutReport") ||
  !paypalLiveCheckoutReportHtml.includes("CN¥69") ||
  !paypalLiveCheckoutReportHtml.includes("PayPal") ||
  !paypalLiveCheckoutReportHtml.includes("x-signature") ||
  !paypalLiveCheckoutReportHtml.includes("duplicate replay") ||
  !paypalLiveCheckoutReportHtml.includes("private delivery") ||
  !paypalLiveCheckoutReportHtml.includes("refund rollback") ||
  !paypalLiveCheckoutReportHtml.includes("pro-kit.html") ||
  !paypalLiveCheckoutReportHtml.includes("lemon-squeezy-production-checkout-readiness-report.html")
) {
  issues.push("Standalone PayPal live checkout report is missing report logic, PayPal launch copy, safety copy, or conversion links.");
}
if (
  !vercelLemonSqueezyDebuggerHtml.includes("Vercel Lemon Squeezy Webhook Debugger") ||
  !vercelLemonSqueezyDebuggerHtml.includes("buildVercelLemonSqueezyWebhookReport") ||
  !vercelLemonSqueezyDebuggerHtml.includes("404") ||
  !vercelLemonSqueezyDebuggerHtml.includes("405") ||
  !vercelLemonSqueezyDebuggerHtml.includes("x-signature") ||
  !vercelLemonSqueezyDebuggerHtml.includes("pro-kit.html") ||
  !vercelLemonSqueezyDebuggerHtml.includes("No API key")
) {
  issues.push("Standalone Vercel Lemon Squeezy debugger is missing diagnostic logic, Vercel failure copy, safety copy, or conversion links.");
}
if (
  !eventCoverageMatrixHtml.includes("Lemon Squeezy webhook event coverage matrix") ||
  !eventCoverageMatrixHtml.includes("buildEventCoverageMatrix") ||
  !eventCoverageMatrixHtml.includes("order_created") ||
  !eventCoverageMatrixHtml.includes("subscription_created") ||
  !eventCoverageMatrixHtml.includes("license_key_created") ||
  !eventCoverageMatrixHtml.includes("x-signature") ||
  !eventCoverageMatrixHtml.includes("idempotency") ||
  !eventCoverageMatrixHtml.includes("duplicate replay") ||
  !eventCoverageMatrixHtml.includes("pro-kit.html") ||
  !eventCoverageMatrixHtml.includes("free-sample.html") ||
  !eventCoverageMatrixHtml.includes("lemon-squeezy-webhook-payload-generator.html")
) {
  issues.push("Standalone webhook event coverage matrix is missing matrix logic, event copy, safety copy, or conversion links.");
}
if (
  !paymentWebhookTestPlanHtml.includes("Payment Webhook Test Plan Generator") ||
  !paymentWebhookTestPlanHtml.includes("buildPlan") ||
  !paymentWebhookTestPlanHtml.includes("Raw-body signature verification") ||
  !paymentWebhookTestPlanHtml.includes("Duplicate replay test") ||
  !paymentWebhookTestPlanHtml.includes("Entitlement decision matrix") ||
  !paymentWebhookTestPlanHtml.includes("Checkout-to-webhook smoke test") ||
  !paymentWebhookTestPlanHtml.includes("Lemon Squeezy") ||
  !paymentWebhookTestPlanHtml.includes("Stripe") ||
  !paymentWebhookTestPlanHtml.includes("Paddle") ||
  !paymentWebhookTestPlanHtml.includes("Polar") ||
  !paymentWebhookTestPlanHtml.includes("pro-kit.html") ||
  !paymentWebhookTestPlanHtml.includes("free-sample.html") ||
  !paymentWebhookTestPlanHtml.includes("nothing uploaded")
) {
  issues.push("Standalone payment webhook test plan generator is missing plan logic, provider copy, browser-only safety copy, or conversion links.");
}

const result = {
  ok: issues.length === 0,
  checkedAt: new Date().toISOString(),
  publicZipFiles: publicZipFiles.map((path) => path.replace(`${root}/`, "")),
  proKitManifest: manifest
    ? {
        fileCount: manifest.contents?.fileCount ?? null,
        tests: manifest.verification?.tests ?? null,
        priceCents: manifest.price?.minorUnits ?? null,
        publicDownload: manifest.delivery?.publicDownload ?? null,
        includesProductionSecrets: manifest.safety?.includesProductionSecrets ?? null,
        callsPaidApis: manifest.safety?.callsPaidApis ?? null
      }
    : null,
  freeSample: {
    bytes: existsSync(freeSampleZipPath) ? statSync(freeSampleZipPath).size : null,
    sha256: freeSampleSha256
  },
  checkout: checkout
    ? {
        status: checkout.status,
        hasCheckoutUrl: Boolean(checkout.checkoutUrl),
        priceCents: checkout.priceCents
      }
    : null,
  issues
};

console.log(JSON.stringify(result, null, 2));

if (!result.ok) {
  process.exit(1);
}
