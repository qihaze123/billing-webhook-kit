import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const publicDir = join(root, "public");
const manifestPath = join(publicDir, "pro-kit-manifest.json");
const freeSampleZipPath = join(publicDir, "billing-webhook-kit-free-sample.zip");
const freeSamplePath = join(publicDir, "free-sample.html");
const proKitPath = join(publicDir, "pro-kit.html");
const statusPath = join(publicDir, "status.html");
const toolIndexPath = join(publicDir, "tools", "index.html");
const signatureVerifierPath = join(publicDir, "tools", "lemon-squeezy-signature-verifier.html");
const payloadGeneratorPath = join(publicDir, "tools", "lemon-squeezy-webhook-payload-generator.html");
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
if (!existsSync(statusPath)) issues.push("Missing public/status.html.");
if (!existsSync(toolIndexPath)) issues.push("Missing public/tools/index.html.");
if (!existsSync(signatureVerifierPath)) issues.push("Missing public/tools/lemon-squeezy-signature-verifier.html.");
if (!existsSync(payloadGeneratorPath)) issues.push("Missing public/tools/lemon-squeezy-webhook-payload-generator.html.");
if (!existsSync(checkoutPath)) issues.push("Missing public/checkout.json.");

const manifest = existsSync(manifestPath) ? readJson(manifestPath) : null;
const checkout = existsSync(checkoutPath) ? readJson(checkoutPath) : null;
const freeSampleHtml = existsSync(freeSamplePath) ? readFileSync(freeSamplePath, "utf8") : "";
const proKitHtml = existsSync(proKitPath) ? readFileSync(proKitPath, "utf8") : "";
const statusHtml = existsSync(statusPath) ? readFileSync(statusPath, "utf8") : "";
const toolIndexHtml = existsSync(toolIndexPath) ? readFileSync(toolIndexPath, "utf8") : "";
const signatureVerifierHtml = existsSync(signatureVerifierPath) ? readFileSync(signatureVerifierPath, "utf8") : "";
const payloadGeneratorHtml = existsSync(payloadGeneratorPath) ? readFileSync(payloadGeneratorPath, "utf8") : "";
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
if (!freeSampleHtml.includes("pro-kit.html") || !freeSampleHtml.includes("pro-kit-manifest.json")) {
  issues.push("Free sample page does not link the Pro Kit preview and manifest.");
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
if (!proKitHtml.includes("29443d9d91e918896049b2c5807e8d2342f0204675bca7eb6a5c2c824f599ad8")) {
  issues.push("Pro Kit page does not expose the public ZIP verification hash.");
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
  !statusHtml.includes("8230974cb0ffd457346201989ae8800378c700fb31144fa5330fba7c2fb5094b") ||
  !statusHtml.includes("29443d9d91e918896049b2c5807e8d2342f0204675bca7eb6a5c2c824f599ad8") ||
  !statusHtml.includes("Awaiting live key")
) {
  issues.push("Status page does not expose manifest, sample hash, Pro Kit hash, and checkout waiting state.");
}
if (
  !toolIndexHtml.includes("lemon-squeezy-webhook-payload-generator.html") ||
  !toolIndexHtml.includes("lemon-squeezy-signature-verifier.html") ||
  !toolIndexHtml.includes("Checkout launch decision tools") ||
  !toolIndexHtml.includes("Launch lane") ||
  !toolIndexHtml.includes("lemon-squeezy-checkout-smoke-test-report.html") ||
  !toolIndexHtml.includes("billing-webhook-launch-readiness-scorecard.html") ||
  !toolIndexHtml.includes("billing-webhook-debug-cost-calculator.html") ||
  !toolIndexHtml.includes("free-sample.html") ||
  !toolIndexHtml.includes("pro-kit.html") ||
  !toolIndexHtml.includes("Browser-only")
) {
  issues.push("Tool index is missing launch-lane links, standalone tool links, conversion links, or browser-only safety copy.");
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
