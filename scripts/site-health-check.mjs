const siteUrl = "https://qihaze123.github.io/billing-webhook-kit";
const expectedPriceCents = 6900;
const expectedCurrencyPolicy = "inherit_store_or_variant_currency";
const requiredSitemapUrls = [
  `${siteUrl}/`,
  `${siteUrl}/guides/`,
  `${siteUrl}/free-sample.html`,
  `${siteUrl}/pro-kit.html`,
  `${siteUrl}/delivery-refund-support.html`,
  `${siteUrl}/status.html`,
  `${siteUrl}/tools/`,
  `${siteUrl}/tools/lemon-squeezy-signature-verifier.html`,
  `${siteUrl}/tools/lemon-squeezy-webhook-payload-generator.html`,
  `${siteUrl}/tools/webhook-signature-mismatch-debugger.html`,
  `${siteUrl}/tools/webhook-idempotency-key-generator.html`,
  `${siteUrl}/tools/stripe-webhook-fixture-generator.html`,
  `${siteUrl}/tools/webhook-replay-curl-generator.html`,
  `${siteUrl}/tools/nextjs-webhook-handler-generator.html`,
  `${siteUrl}/tools/webhook-entitlement-decision-matrix.html`,
  `${siteUrl}/tools/billing-webhook-debug-cost-calculator.html`,
  `${siteUrl}/tools/billing-webhook-launch-readiness-scorecard.html`,
  `${siteUrl}/tools/lemon-squeezy-checkout-smoke-test-report.html`,
  `${siteUrl}/guides/lemon-squeezy-webhook-test.html`,
  `${siteUrl}/guides/lemon-squeezy-webhook-raw-body-nextjs.html`,
  `${siteUrl}/guides/lemon-squeezy-x-signature-invalid.html`,
  `${siteUrl}/guides/lemon-squeezy-order-created-fixture.html`,
  `${siteUrl}/guides/lemon-squeezy-checkout-smoke-test.html`,
  `${siteUrl}/guides/lemon-squeezy-checkout-404-custom-price-currency.html`,
  `${siteUrl}/guides/lemon-squeezy-paypal-checkout-webhook-test.html`,
  `${siteUrl}/guides/lemon-squeezy-webhook-not-firing-after-checkout.html`,
  `${siteUrl}/guides/lemon-squeezy-digital-download-fulfillment.html`,
  `${siteUrl}/guides/stripe-webhook-signature-verification-nextjs.html`,
  `${siteUrl}/guides/payment-webhook-contract-test-generator.html`
];

async function fetchText(url) {
  try {
    const response = await fetch(url, { redirect: "follow" });
    return {
      ok: response.ok,
      status: response.status,
      finalUrl: response.url,
      text: await response.text()
    };
  } catch (error) {
    return {
      ok: false,
      status: null,
      finalUrl: url,
      text: "",
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function checkoutState(checkout) {
  if (!checkout) {
    return {
      ok: false,
      state: "unreadable",
      issues: ["checkout.json is not valid JSON."]
    };
  }

  const waiting =
    checkout.checkoutUrl === "" &&
    checkout.environment === "production" &&
    checkout.status === "awaiting_live_key" &&
    checkout.priceCents === expectedPriceCents &&
    checkout.currencyPolicy === expectedCurrencyPolicy;

  const ready =
    Boolean(checkout.checkoutUrl) &&
    checkout.environment === "production" &&
    checkout.status === "ready" &&
    checkout.priceCents === expectedPriceCents &&
    checkout.currencyPolicy === expectedCurrencyPolicy &&
    String(checkout.checkoutUrl).startsWith("https://");

  const issues = [];
  if (!waiting && !ready) {
    if (checkout.environment !== "production") issues.push("checkout environment is not production.");
    if (checkout.priceCents !== expectedPriceCents) issues.push("checkout price is not CN¥69 minor units.");
    if (checkout.currencyPolicy !== expectedCurrencyPolicy) issues.push("checkout currency policy changed.");
    if (checkout.checkoutUrl && checkout.status !== "ready") issues.push("checkout URL exists but status is not ready.");
    if (!checkout.checkoutUrl && checkout.status !== "awaiting_live_key") {
      issues.push("checkout URL is empty but status is not awaiting_live_key.");
    }
  }

  return {
    ok: waiting || ready,
    state: ready ? "ready" : waiting ? "awaiting_live_key" : "unsafe_or_incomplete",
    issues
  };
}

const [
  home,
  proKit,
  deliverySupport,
  freeSample,
  statusPage,
  toolIndex,
  signatureVerifier,
  payloadGenerator,
  mismatchDebugger,
  idempotencyGenerator,
  stripeGenerator,
  replayGenerator,
  nextjsGenerator,
  entitlementMatrix,
  costCalculator,
  readinessScorecard,
  checkoutSmokeReport,
  guideIndex,
  checkoutSmokeGuide,
  checkout404Guide,
  paypalCheckoutGuide,
  webhookNotFiringGuide,
  digitalDownloadGuide,
  stripeNextjsGuide,
  sitemap,
  robots,
  llms,
  checkoutResult
] = await Promise.all([
  fetchText(`${siteUrl}/`),
  fetchText(`${siteUrl}/pro-kit.html`),
  fetchText(`${siteUrl}/delivery-refund-support.html`),
  fetchText(`${siteUrl}/free-sample.html`),
  fetchText(`${siteUrl}/status.html`),
  fetchText(`${siteUrl}/tools/`),
  fetchText(`${siteUrl}/tools/lemon-squeezy-signature-verifier.html`),
  fetchText(`${siteUrl}/tools/lemon-squeezy-webhook-payload-generator.html`),
  fetchText(`${siteUrl}/tools/webhook-signature-mismatch-debugger.html`),
  fetchText(`${siteUrl}/tools/webhook-idempotency-key-generator.html`),
  fetchText(`${siteUrl}/tools/stripe-webhook-fixture-generator.html`),
  fetchText(`${siteUrl}/tools/webhook-replay-curl-generator.html`),
  fetchText(`${siteUrl}/tools/nextjs-webhook-handler-generator.html`),
  fetchText(`${siteUrl}/tools/webhook-entitlement-decision-matrix.html`),
  fetchText(`${siteUrl}/tools/billing-webhook-debug-cost-calculator.html`),
  fetchText(`${siteUrl}/tools/billing-webhook-launch-readiness-scorecard.html`),
  fetchText(`${siteUrl}/tools/lemon-squeezy-checkout-smoke-test-report.html`),
  fetchText(`${siteUrl}/guides/`),
  fetchText(`${siteUrl}/guides/lemon-squeezy-checkout-smoke-test.html`),
  fetchText(`${siteUrl}/guides/lemon-squeezy-checkout-404-custom-price-currency.html`),
  fetchText(`${siteUrl}/guides/lemon-squeezy-paypal-checkout-webhook-test.html`),
  fetchText(`${siteUrl}/guides/lemon-squeezy-webhook-not-firing-after-checkout.html`),
  fetchText(`${siteUrl}/guides/lemon-squeezy-digital-download-fulfillment.html`),
  fetchText(`${siteUrl}/guides/stripe-webhook-signature-verification-nextjs.html`),
  fetchText(`${siteUrl}/sitemap.xml`),
  fetchText(`${siteUrl}/robots.txt`),
  fetchText(`${siteUrl}/llms.txt`),
  fetchText(`${siteUrl}/checkout.json`)
]);

const checkout = parseJson(checkoutResult.text);
const checkoutEvaluation = checkoutState(checkout);
const sitemapUrls = [...sitemap.text.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
const issues = [
  ...(home.ok ? [] : [`homepage returned HTTP ${home.status ?? "failed"}.`]),
  ...(proKit.ok ? [] : [`pro-kit page returned HTTP ${proKit.status ?? "failed"}.`]),
  ...(deliverySupport.ok ? [] : [`delivery support page returned HTTP ${deliverySupport.status ?? "failed"}.`]),
  ...(freeSample.ok ? [] : [`free sample page returned HTTP ${freeSample.status ?? "failed"}.`]),
  ...(statusPage.ok ? [] : [`status page returned HTTP ${statusPage.status ?? "failed"}.`]),
  ...(toolIndex.ok ? [] : [`tool index page returned HTTP ${toolIndex.status ?? "failed"}.`]),
  ...(signatureVerifier.ok
    ? []
    : [`signature verifier page returned HTTP ${signatureVerifier.status ?? "failed"}.`]),
  ...(payloadGenerator.ok
    ? []
    : [`payload generator page returned HTTP ${payloadGenerator.status ?? "failed"}.`]),
  ...(mismatchDebugger.ok
    ? []
    : [`signature mismatch debugger page returned HTTP ${mismatchDebugger.status ?? "failed"}.`]),
  ...(idempotencyGenerator.ok
    ? []
    : [`idempotency generator page returned HTTP ${idempotencyGenerator.status ?? "failed"}.`]),
  ...(stripeGenerator.ok ? [] : [`stripe generator page returned HTTP ${stripeGenerator.status ?? "failed"}.`]),
  ...(replayGenerator.ok ? [] : [`replay generator page returned HTTP ${replayGenerator.status ?? "failed"}.`]),
  ...(nextjsGenerator.ok ? [] : [`Next.js generator page returned HTTP ${nextjsGenerator.status ?? "failed"}.`]),
  ...(entitlementMatrix.ok
    ? []
    : [`entitlement matrix page returned HTTP ${entitlementMatrix.status ?? "failed"}.`]),
  ...(costCalculator.ok
    ? []
    : [`debug cost calculator page returned HTTP ${costCalculator.status ?? "failed"}.`]),
  ...(readinessScorecard.ok
    ? []
    : [`readiness scorecard page returned HTTP ${readinessScorecard.status ?? "failed"}.`]),
  ...(checkoutSmokeReport.ok
    ? []
    : [`checkout smoke test report page returned HTTP ${checkoutSmokeReport.status ?? "failed"}.`]),
  ...(guideIndex.ok ? [] : [`guide index returned HTTP ${guideIndex.status ?? "failed"}.`]),
  ...(checkoutSmokeGuide.ok
    ? []
    : [`Lemon Squeezy checkout smoke test guide returned HTTP ${checkoutSmokeGuide.status ?? "failed"}.`]),
  ...(checkout404Guide.ok
    ? []
    : [`Lemon Squeezy checkout 404 guide returned HTTP ${checkout404Guide.status ?? "failed"}.`]),
  ...(paypalCheckoutGuide.ok
    ? []
    : [`Lemon Squeezy PayPal checkout webhook guide returned HTTP ${paypalCheckoutGuide.status ?? "failed"}.`]),
  ...(webhookNotFiringGuide.ok
    ? []
    : [`Lemon Squeezy webhook not firing guide returned HTTP ${webhookNotFiringGuide.status ?? "failed"}.`]),
  ...(digitalDownloadGuide.ok
    ? []
    : [`Lemon Squeezy digital download fulfillment guide returned HTTP ${digitalDownloadGuide.status ?? "failed"}.`]),
  ...(stripeNextjsGuide.ok
    ? []
    : [`Stripe Next.js signature guide returned HTTP ${stripeNextjsGuide.status ?? "failed"}.`]),
  ...(sitemap.ok ? [] : [`sitemap returned HTTP ${sitemap.status ?? "failed"}.`]),
  ...(robots.ok ? [] : [`robots.txt returned HTTP ${robots.status ?? "failed"}.`]),
  ...(llms.ok ? [] : [`llms.txt returned HTTP ${llms.status ?? "failed"}.`]),
  ...(checkoutResult.ok ? [] : [`checkout.json returned HTTP ${checkoutResult.status ?? "failed"}.`]),
  ...(sitemapUrls.length >= 56 ? [] : [`sitemap has only ${sitemapUrls.length} URLs; expected at least 56.`]),
  ...requiredSitemapUrls
    .filter((url) => !sitemapUrls.includes(url))
    .map((url) => `sitemap is missing ${url}.`),
  ...(robots.text.includes(`Sitemap: ${siteUrl}/sitemap.xml`) ? [] : ["robots.txt is missing the sitemap directive."]),
  ...(llms.text.includes(`${siteUrl}/pro-kit.html`) ? [] : ["llms.txt is missing the Pro Kit URL."]),
  ...(llms.text.includes(`${siteUrl}/delivery-refund-support.html`)
    ? []
    : ["llms.txt is missing the delivery, refund, and support policy URL."]),
  ...(llms.text.includes(`${siteUrl}/status.html`) ? [] : ["llms.txt is missing the public status URL."]),
  ...(llms.text.includes(`${siteUrl}/tools/`) ? [] : ["llms.txt is missing the tool index URL."]),
  ...(llms.text.includes(`${siteUrl}/tools/lemon-squeezy-signature-verifier.html`)
    ? []
    : ["llms.txt is missing the standalone signature verifier URL."]),
  ...(llms.text.includes(`${siteUrl}/tools/lemon-squeezy-webhook-payload-generator.html`)
    ? []
    : ["llms.txt is missing the standalone payload generator URL."]),
  ...(llms.text.includes(`${siteUrl}/tools/webhook-signature-mismatch-debugger.html`)
    ? []
    : ["llms.txt is missing the standalone signature mismatch debugger URL."]),
  ...(llms.text.includes(`${siteUrl}/tools/webhook-idempotency-key-generator.html`)
    ? []
    : ["llms.txt is missing the standalone idempotency generator URL."]),
  ...(llms.text.includes(`${siteUrl}/tools/stripe-webhook-fixture-generator.html`)
    ? []
    : ["llms.txt is missing the standalone Stripe generator URL."]),
  ...(llms.text.includes(`${siteUrl}/tools/webhook-replay-curl-generator.html`)
    ? []
    : ["llms.txt is missing the standalone replay cURL generator URL."]),
  ...(llms.text.includes(`${siteUrl}/tools/nextjs-webhook-handler-generator.html`)
    ? []
    : ["llms.txt is missing the standalone Next.js generator URL."]),
  ...(llms.text.includes(`${siteUrl}/tools/webhook-entitlement-decision-matrix.html`)
    ? []
    : ["llms.txt is missing the standalone entitlement matrix URL."]),
  ...(llms.text.includes(`${siteUrl}/tools/billing-webhook-debug-cost-calculator.html`)
    ? []
    : ["llms.txt is missing the standalone debug cost calculator URL."]),
  ...(llms.text.includes(`${siteUrl}/tools/billing-webhook-launch-readiness-scorecard.html`)
    ? []
    : ["llms.txt is missing the standalone launch readiness scorecard URL."]),
  ...(llms.text.includes(`${siteUrl}/tools/lemon-squeezy-checkout-smoke-test-report.html`)
    ? []
    : ["llms.txt is missing the standalone checkout smoke test report URL."]),
  ...(llms.text.includes(`${siteUrl}/guides/lemon-squeezy-checkout-smoke-test.html`)
    ? []
    : ["llms.txt is missing the Lemon Squeezy checkout smoke test guide URL."]),
  ...(llms.text.includes(`${siteUrl}/guides/lemon-squeezy-checkout-404-custom-price-currency.html`)
    ? []
    : ["llms.txt is missing the Lemon Squeezy checkout 404 custom price currency guide URL."]),
  ...(llms.text.includes(`${siteUrl}/guides/lemon-squeezy-paypal-checkout-webhook-test.html`)
    ? []
    : ["llms.txt is missing the Lemon Squeezy PayPal checkout webhook test guide URL."]),
  ...(llms.text.includes(`${siteUrl}/guides/lemon-squeezy-webhook-not-firing-after-checkout.html`)
    ? []
    : ["llms.txt is missing the Lemon Squeezy webhook not firing after checkout guide URL."]),
  ...(llms.text.includes(`${siteUrl}/guides/lemon-squeezy-digital-download-fulfillment.html`)
    ? []
    : ["llms.txt is missing the Lemon Squeezy digital download fulfillment guide URL."]),
  ...(llms.text.includes(`${siteUrl}/guides/stripe-webhook-signature-verification-nextjs.html`)
    ? []
    : ["llms.txt is missing the Stripe Next.js signature guide URL."]),
  ...(llms.text.includes("Site Health Check workflow")
    ? []
    : ["llms.txt is missing the public Site Health Check signal."]),
  ...(statusPage.text.includes("Checkout, package, and crawlability signals in one place.") &&
  statusPage.text.includes("pro-kit-manifest.json") &&
  statusPage.text.includes("delivery-refund-support.html") &&
  statusPage.text.includes("sitemap.xml") &&
  statusPage.text.includes("Search Console")
    ? []
    : ["status page is missing checkout, manifest, delivery support, sitemap, or Search Console signals."]),
  ...(deliverySupport.text.includes("Delivery, refund, and support details before checkout.") &&
  deliverySupport.text.includes("Private ZIP after live checkout") &&
  deliverySupport.text.includes("Public manifest and SHA-256") &&
  deliverySupport.text.includes("Refund Triggers") &&
  deliverySupport.text.includes("No live secrets or customer data in public issues") &&
  deliverySupport.text.includes("pro-kit.html") &&
  deliverySupport.text.includes("free-sample.html") &&
  deliverySupport.text.includes("status.html")
    ? []
    : ["delivery support page is missing buyer assurance, verification, refund, safety, or conversion links."]),
  ...(toolIndex.text.includes("Payment webhook tools for the work before checkout goes live.") &&
  toolIndex.text.includes("Checkout launch decision tools") &&
  toolIndex.text.includes("Launch lane") &&
  toolIndex.text.includes("Lemon Squeezy webhook payload generator") &&
  toolIndex.text.includes("Lemon Squeezy x-signature verifier") &&
  toolIndex.text.includes("Webhook signature mismatch debugger") &&
  toolIndex.text.includes("Webhook idempotency key generator") &&
  toolIndex.text.includes("Stripe webhook fixture generator") &&
  toolIndex.text.includes("Webhook replay cURL generator") &&
  toolIndex.text.includes("Next.js webhook handler generator") &&
  toolIndex.text.includes("Webhook entitlement decision matrix") &&
  toolIndex.text.includes("Billing webhook debug cost calculator") &&
  toolIndex.text.includes("Billing webhook launch readiness scorecard") &&
  toolIndex.text.includes("Lemon Squeezy checkout smoke test report") &&
  toolIndex.text.includes("Download the free sample") &&
  toolIndex.text.includes("Preview the CN¥69 Pro Kit")
    ? []
    : ["tool index page is missing tool cards or conversion links."]),
  ...(signatureVerifier.text.includes("Lemon Squeezy x-signature checker") &&
  signatureVerifier.text.includes("crypto.subtle") &&
  signatureVerifier.text.includes("Download the free sample") &&
  signatureVerifier.text.includes("Preview the CNY 69 Pro Kit")
    ? []
    : ["signature verifier page is missing verifier logic or conversion links."]),
  ...(payloadGenerator.text.includes("Generate fake Lemon Squeezy webhook payloads") &&
  payloadGenerator.text.includes("buildCurl") &&
  payloadGenerator.text.includes("crypto.subtle") &&
  payloadGenerator.text.includes("Download the free sample") &&
  payloadGenerator.text.includes("Preview the CNY 69 Pro Kit")
    ? []
    : ["payload generator page is missing payload logic, signature logic, or conversion links."]),
  ...(mismatchDebugger.text.includes("Webhook signature mismatch debugger") &&
  mismatchDebugger.text.includes("diagnoseSignatureMismatch") &&
  mismatchDebugger.text.includes("JSON reserialization risk") &&
  mismatchDebugger.text.includes("Preview the CNY 69 Pro Kit")
    ? []
    : ["signature mismatch debugger page is missing mismatch copy, diagnosis logic, or conversion links."]),
  ...(idempotencyGenerator.text.includes("Webhook idempotency key generator") &&
  idempotencyGenerator.text.includes("buildIdempotencyKey") &&
  idempotencyGenerator.text.includes("Duplicate delivery runs side effects once") &&
  idempotencyGenerator.text.includes("Preview the CNY 69 Pro Kit")
    ? []
    : ["idempotency generator page is missing key logic, replay safety copy, or conversion links."]),
  ...(stripeGenerator.text.includes("Stripe Webhook Fixture Generator") &&
  stripeGenerator.text.includes("Stripe-Signature") &&
  stripeGenerator.text.includes("hmacSha256Hex") &&
  stripeGenerator.text.includes("Preview the CNY 69 Pro Kit")
    ? []
    : ["stripe generator page is missing fixture copy, signature logic, or conversion links."]),
  ...(replayGenerator.text.includes("Webhook Replay cURL Generator") &&
  replayGenerator.text.includes("hmacSha256Hex") &&
  replayGenerator.text.includes("Duplicate replay smoke test") &&
  replayGenerator.text.includes("Preview the CNY 69 Pro Kit")
    ? []
    : ["replay generator page is missing replay copy, signature logic, or conversion links."]),
  ...(nextjsGenerator.text.includes("Next.js Webhook Handler Generator") &&
  nextjsGenerator.text.includes("request.text()") &&
  nextjsGenerator.text.includes("timingSafeEqual") &&
  nextjsGenerator.text.includes("Preview the CNY 69 Pro Kit")
    ? []
    : ["Next.js generator page is missing handler copy, raw-body logic, or conversion links."]),
  ...(entitlementMatrix.text.includes("Webhook entitlement decision matrix generator") &&
  entitlementMatrix.text.includes("provider-specific access decisions") &&
  entitlementMatrix.text.includes("duplicate replay tests") &&
  entitlementMatrix.text.includes("Preview the CNY 69 Pro Kit")
    ? []
    : ["entitlement matrix page is missing matrix copy, replay test copy, or conversion links."]),
  ...(costCalculator.text.includes("Billing webhook debug cost calculator") &&
  costCalculator.text.includes("calculateAvoidableCost") &&
  costCalculator.text.includes("Break-even against CNY 69 Pro Kit") &&
  costCalculator.text.includes("Preview the CNY 69 Pro Kit")
    ? []
    : ["debug cost calculator page is missing calculator copy, cost logic, or conversion links."]),
  ...(readinessScorecard.text.includes("Billing Webhook Launch Readiness Scorecard") &&
  readinessScorecard.text.includes("Launch readiness score") &&
  readinessScorecard.text.includes("PR-ready Markdown release report") &&
  readinessScorecard.text.includes("Preview the CNY 69 Pro Kit")
    ? []
    : ["readiness scorecard page is missing scorecard copy, report copy, or conversion links."]),
  ...(checkoutSmokeReport.text.includes("Lemon Squeezy checkout smoke test report") &&
  checkoutSmokeReport.text.includes("buildCheckoutSmokeReport") &&
  checkoutSmokeReport.text.includes("PR-ready checkout smoke test report") &&
  checkoutSmokeReport.text.includes("Preview the CNY 69 Pro Kit")
    ? []
    : ["checkout smoke test report page is missing report copy, report logic, or conversion links."]),
  ...(checkoutSmokeGuide.text.includes("Lemon Squeezy checkout smoke test") &&
  checkoutSmokeGuide.text.includes("CN¥69 price") &&
  checkoutSmokeGuide.text.includes("order_created") &&
  checkoutSmokeGuide.text.includes("View Pro Kit preview")
    ? []
    : ["Lemon Squeezy checkout smoke test guide is missing price copy, paid-order copy, or conversion links."]),
  ...(checkout404Guide.text.includes("Lemon Squeezy checkout 404") &&
  checkout404Guide.text.includes("custom_price") &&
  checkout404Guide.text.includes("CN¥69.00") &&
  checkout404Guide.text.includes("View Pro Kit preview")
    ? []
    : ["Lemon Squeezy checkout 404 guide is missing custom price, currency, or conversion copy."]),
  ...(paypalCheckoutGuide.text.includes("Lemon Squeezy PayPal checkout webhook test") &&
  paypalCheckoutGuide.text.includes("PayPal") &&
  paypalCheckoutGuide.text.includes("order_created") &&
  paypalCheckoutGuide.text.includes("View Pro Kit preview")
    ? []
    : ["Lemon Squeezy PayPal checkout webhook guide is missing PayPal, paid-order, or conversion copy."]),
  ...(webhookNotFiringGuide.text.includes("Lemon Squeezy webhook not firing after checkout") &&
  webhookNotFiringGuide.text.includes("live/test") &&
  webhookNotFiringGuide.text.includes("order_created") &&
  webhookNotFiringGuide.text.includes("View Pro Kit preview")
    ? []
    : ["Lemon Squeezy webhook not firing guide is missing environment, event, or conversion copy."]),
  ...(digitalDownloadGuide.text.includes("Deliver a digital download after Lemon Squeezy checkout") &&
  digitalDownloadGuide.text.includes("private ZIP") &&
  digitalDownloadGuide.text.includes("x-signature") &&
  digitalDownloadGuide.text.includes("idempotency") &&
  digitalDownloadGuide.text.includes("delivery-refund-support.html") &&
  digitalDownloadGuide.text.includes("pro-kit.html") &&
  digitalDownloadGuide.text.includes("free-sample.html")
    ? []
    : ["Lemon Squeezy digital download fulfillment guide is missing private delivery, signature, idempotency, policy, or conversion copy."]),
  ...(stripeNextjsGuide.text.includes("Stripe webhook signature verification in Next.js") &&
  stripeNextjsGuide.text.includes("request.text()") &&
  stripeNextjsGuide.text.includes("Stripe-Signature") &&
  stripeNextjsGuide.text.includes("View Pro Kit preview")
    ? []
    : ["Stripe Next.js signature guide is missing raw-body copy, Stripe signature copy, or conversion links."]),
  ...(home.text.includes("Automated site health checks")
    ? []
    : ["homepage is missing the automated site health trust signal."]),
  ...(home.text.includes("delivery-refund-support.html")
    ? []
    : ["homepage is missing the delivery, refund, and support policy link."]),
  ...(home.text.includes("lemon-squeezy-checkout-smoke-test.html") &&
  home.text.includes("lemon-squeezy-checkout-404-custom-price-currency.html") &&
  home.text.includes("lemon-squeezy-paypal-checkout-webhook-test.html")
    ? []
    : ["homepage is missing checkout launch guide links in static discovery content."]),
  ...(proKit.text.includes("Buy it when the free sample stops being enough")
    ? []
    : ["Pro Kit page is missing the buying-decision section."]),
  ...(proKit.text.includes("delivery-refund-support.html") &&
  proKit.text.includes("support and refund")
    ? []
    : ["Pro Kit page is missing delivery, support, or refund policy links."]),
  ...(proKit.text.includes("Checkout Launch Gates") &&
  proKit.text.includes("lemon-squeezy-checkout-smoke-test.html") &&
  proKit.text.includes("lemon-squeezy-paypal-checkout-webhook-test.html") &&
  proKit.text.includes("lemon-squeezy-checkout-404-custom-price-currency.html") &&
  proKit.text.includes("lemon-squeezy-checkout-smoke-test-report.html")
    ? []
    : ["Pro Kit page is missing checkout launch gate conversion links."]),
  ...(proKit.text.includes("What the paid pack adds after the browser tools find the gap") &&
  proKit.text.includes("Tool-to-Pro Map") &&
  proKit.text.includes("Mismatch debugger") &&
  proKit.text.includes("Entitlement matrix") &&
  proKit.text.includes("Cost calculator") &&
  proKit.text.includes("Readiness scorecard") &&
  proKit.text.includes("Checkout smoke report")
    ? []
    : ["Pro Kit page is missing the tool-to-Pro upgrade map."]),
  ...((proKit.text.match(/class="decision-item"/g) || []).length === 3
    ? []
    : ["Pro Kit page does not expose 3 buying-decision cards."]),
  ...((proKit.text.match(/class="tool-map-row"/g) || []).length === 10
    ? []
    : ["Pro Kit page does not expose 10 tool-to-Pro map rows."]),
  ...((proKit.text.match(/"@type": "Question"/g) || []).length >= 7
    ? []
    : ["Pro Kit page exposes fewer than 7 FAQ schema questions."]),
  ...(freeSample.text.includes("Free sample to Pro Kit upgrade path") &&
  freeSample.text.includes("pro-kit.html") &&
  freeSample.text.includes("pro-kit-manifest.json") &&
  freeSample.text.includes("delivery-refund-support.html")
    ? []
    : ["Free sample page is missing the Pro Kit upgrade path, delivery policy, or verification links."]),
  ...(freeSample.text.includes("Launch gates that point to the Pro Kit") &&
  freeSample.text.includes("lemon-squeezy-checkout-smoke-test.html") &&
  freeSample.text.includes("lemon-squeezy-paypal-checkout-webhook-test.html") &&
  freeSample.text.includes("lemon-squeezy-checkout-404-custom-price-currency.html") &&
  freeSample.text.includes("lemon-squeezy-checkout-smoke-test-report.html")
    ? []
    : ["Free sample page is missing checkout launch gate upgrade links."]),
  ...checkoutEvaluation.issues.map((issue) => `checkout: ${issue}`)
];

const result = {
  ok: issues.length === 0,
  checkedAt: new Date().toISOString(),
  siteUrl,
  pages: {
    home: home.status,
    proKit: proKit.status,
    deliverySupport: deliverySupport.status,
    freeSample: freeSample.status,
    statusPage: statusPage.status,
    toolIndex: toolIndex.status,
    signatureVerifier: signatureVerifier.status,
    payloadGenerator: payloadGenerator.status,
    mismatchDebugger: mismatchDebugger.status,
    idempotencyGenerator: idempotencyGenerator.status,
    stripeGenerator: stripeGenerator.status,
    replayGenerator: replayGenerator.status,
    nextjsGenerator: nextjsGenerator.status,
    entitlementMatrix: entitlementMatrix.status,
    costCalculator: costCalculator.status,
    readinessScorecard: readinessScorecard.status,
    checkoutSmokeReport: checkoutSmokeReport.status,
    checkoutSmokeGuide: checkoutSmokeGuide.status,
    checkout404Guide: checkout404Guide.status,
    paypalCheckoutGuide: paypalCheckoutGuide.status,
    webhookNotFiringGuide: webhookNotFiringGuide.status,
    digitalDownloadGuide: digitalDownloadGuide.status,
    stripeNextjsGuide: stripeNextjsGuide.status,
    guideIndex: guideIndex.status,
    sitemap: sitemap.status,
    robots: robots.status,
    llms: llms.status,
    checkout: checkoutResult.status
  },
  sitemap: {
    urlCount: sitemapUrls.length,
    requiredUrlCount: requiredSitemapUrls.length
  },
  checkout: {
    state: checkoutEvaluation.state,
    hasCheckoutUrl: Boolean(checkout?.checkoutUrl),
    priceCents: checkout?.priceCents ?? null
  },
  issues
};

console.log(JSON.stringify(result, null, 2));

if (!result.ok) {
  process.exit(1);
}
