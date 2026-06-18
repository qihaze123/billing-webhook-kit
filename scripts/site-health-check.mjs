const siteUrl = "https://qihaze123.github.io/billing-webhook-kit";
const expectedPriceCents = 6900;
const expectedCurrencyPolicy = "inherit_store_or_variant_currency";
const requiredSitemapUrls = [
  `${siteUrl}/`,
  `${siteUrl}/guides/`,
  `${siteUrl}/free-sample.html`,
  `${siteUrl}/pro-kit.html`,
  `${siteUrl}/billing-webhook-kit-pro-sample-report.html`,
  `${siteUrl}/delivery-refund-support.html`,
  `${siteUrl}/status.html`,
  `${siteUrl}/sitemap.html`,
  `${siteUrl}/search-console-sitemap-submission.html`,
  `${siteUrl}/troubleshooting.html`,
  `${siteUrl}/billing-webhook-launch-evidence-pack.html`,
  `${siteUrl}/tools/`,
  `${siteUrl}/tools/lemon-squeezy-signature-verifier.html`,
  `${siteUrl}/tools/lemon-squeezy-webhook-payload-generator.html`,
  `${siteUrl}/tools/webhook-signature-mismatch-debugger.html`,
  `${siteUrl}/tools/webhook-idempotency-key-generator.html`,
  `${siteUrl}/tools/stripe-webhook-fixture-generator.html`,
  `${siteUrl}/tools/webhook-replay-curl-generator.html`,
  `${siteUrl}/tools/nextjs-webhook-handler-generator.html`,
  `${siteUrl}/tools/nextjs-lemon-squeezy-raw-body-audit.html`,
  `${siteUrl}/tools/vercel-lemon-squeezy-webhook-debugger.html`,
  `${siteUrl}/tools/payment-webhook-test-plan-generator.html`,
  `${siteUrl}/tools/webhook-entitlement-decision-matrix.html`,
  `${siteUrl}/tools/billing-webhook-debug-cost-calculator.html`,
  `${siteUrl}/tools/billing-webhook-launch-readiness-scorecard.html`,
  `${siteUrl}/tools/checkout-provider-decision-matrix.html`,
  `${siteUrl}/tools/billing-webhook-pro-fit-checker.html`,
  `${siteUrl}/tools/lemon-squeezy-checkout-smoke-test-report.html`,
  `${siteUrl}/tools/lemon-squeezy-paypal-live-checkout-report.html`,
  `${siteUrl}/tools/lemon-squeezy-production-checkout-readiness-report.html`,
  `${siteUrl}/tools/lemon-squeezy-fulfillment-checklist-generator.html`,
  `${siteUrl}/tools/lemon-squeezy-refund-rollback-report.html`,
  `${siteUrl}/tools/lemon-squeezy-delivery-email-template-generator.html`,
  `${siteUrl}/tools/lemon-squeezy-webhook-event-coverage-matrix.html`,
  `${siteUrl}/guides/lemon-squeezy-webhook-test.html`,
  `${siteUrl}/guides/lemon-squeezy-webhook-raw-body-nextjs.html`,
  `${siteUrl}/guides/lemon-squeezy-x-signature-invalid.html`,
  `${siteUrl}/guides/lemon-squeezy-order-created-fixture.html`,
  `${siteUrl}/guides/lemon-squeezy-checkout-smoke-test.html`,
  `${siteUrl}/guides/lemon-squeezy-checkout-404-custom-price-currency.html`,
  `${siteUrl}/guides/lemon-squeezy-paypal-checkout-webhook-test.html`,
  `${siteUrl}/guides/lemon-squeezy-production-checkout-go-live.html`,
  `${siteUrl}/guides/lemon-squeezy-production-webhook-troubleshooting.html`,
  `${siteUrl}/guides/nextjs-webhook-405-lemon-squeezy.html`,
  `${siteUrl}/guides/lemon-squeezy-webhook-500-vercel-nextjs.html`,
  `${siteUrl}/guides/lemon-squeezy-webhook-retry-idempotency.html`,
  `${siteUrl}/guides/payment-webhook-test-tool-alternatives.html`,
  `${siteUrl}/guides/lemon-squeezy-webhook-not-firing-after-checkout.html`,
  `${siteUrl}/guides/lemon-squeezy-digital-download-fulfillment.html`,
  `${siteUrl}/guides/lemon-squeezy-refund-webhook-test.html`,
  `${siteUrl}/guides/nextjs-payment-webhook-refund-rollback-test.html`,
  `${siteUrl}/guides/stripe-webhook-signature-verification-nextjs.html`,
  `${siteUrl}/guides/stripe-webhook-test-plan-nextjs.html`,
  `${siteUrl}/guides/stripe-refund-webhook-rollback-nextjs.html`,
  `${siteUrl}/guides/paddle-webhook-signature-verification-nextjs.html`,
  `${siteUrl}/guides/nextjs-paddle-webhook-handler.html`,
  `${siteUrl}/guides/paddle-webhook-test-plan-nextjs.html`,
  `${siteUrl}/guides/nextjs-payment-webhook-entitlement-test-matrix.html`,
  `${siteUrl}/guides/ai-saas-billing-webhook-checklist.html`,
  `${siteUrl}/guides/lemon-squeezy-vs-stripe-webhooks-ai-saas.html`,
  `${siteUrl}/guides/billing-webhook-kit-pricing-roi.html`,
  `${siteUrl}/guides/billing-webhook-kit-buyer-checklist.html`,
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
  proSampleReport,
  deliverySupport,
  freeSample,
  statusPage,
  sitemapHtml,
  searchConsoleHandoff,
  troubleshootingHub,
  launchEvidencePack,
  toolIndex,
  signatureVerifier,
  payloadGenerator,
  mismatchDebugger,
  idempotencyGenerator,
  stripeGenerator,
  replayGenerator,
  nextjsGenerator,
  nextjsRawBodyAudit,
  vercelLemonSqueezyDebugger,
  paymentWebhookTestPlan,
  entitlementMatrix,
  costCalculator,
  readinessScorecard,
  checkoutProviderDecisionMatrix,
  proFitChecker,
  checkoutSmokeReport,
  paypalLiveCheckoutReport,
  productionCheckoutReadinessReport,
  fulfillmentChecklist,
  refundRollbackReport,
  deliveryEmailTemplates,
  eventCoverageMatrix,
  guideIndex,
  checkoutSmokeGuide,
  checkout404Guide,
  paypalCheckoutGuide,
  productionCheckoutGoLiveGuide,
  productionWebhookTroubleshootingGuide,
  nextjs405Guide,
  webhook500Guide,
  retryIdempotencyGuide,
  alternativesGuide,
  webhookNotFiringGuide,
  digitalDownloadGuide,
  refundWebhookGuide,
  nextjsRefundRollbackGuide,
  stripeNextjsGuide,
  stripeNextjsTestPlanGuide,
  stripeRefundRollbackGuide,
  paddleNextjsSignatureGuide,
  nextjsPaddleWebhookHandlerGuide,
  paddleNextjsTestPlanGuide,
  nextjsEntitlementMatrixGuide,
  aiSaasBillingWebhookChecklist,
  lemonSqueezyVsStripeAiSaasGuide,
  pricingRoiGuide,
  buyerChecklistGuide,
  sitemap,
  robots,
  llms,
  checkoutResult
] = await Promise.all([
  fetchText(`${siteUrl}/`),
  fetchText(`${siteUrl}/pro-kit.html`),
  fetchText(`${siteUrl}/billing-webhook-kit-pro-sample-report.html`),
  fetchText(`${siteUrl}/delivery-refund-support.html`),
  fetchText(`${siteUrl}/free-sample.html`),
  fetchText(`${siteUrl}/status.html`),
  fetchText(`${siteUrl}/sitemap.html`),
  fetchText(`${siteUrl}/search-console-sitemap-submission.html`),
  fetchText(`${siteUrl}/troubleshooting.html`),
  fetchText(`${siteUrl}/billing-webhook-launch-evidence-pack.html`),
  fetchText(`${siteUrl}/tools/`),
  fetchText(`${siteUrl}/tools/lemon-squeezy-signature-verifier.html`),
  fetchText(`${siteUrl}/tools/lemon-squeezy-webhook-payload-generator.html`),
  fetchText(`${siteUrl}/tools/webhook-signature-mismatch-debugger.html`),
  fetchText(`${siteUrl}/tools/webhook-idempotency-key-generator.html`),
  fetchText(`${siteUrl}/tools/stripe-webhook-fixture-generator.html`),
  fetchText(`${siteUrl}/tools/webhook-replay-curl-generator.html`),
  fetchText(`${siteUrl}/tools/nextjs-webhook-handler-generator.html`),
  fetchText(`${siteUrl}/tools/nextjs-lemon-squeezy-raw-body-audit.html`),
  fetchText(`${siteUrl}/tools/vercel-lemon-squeezy-webhook-debugger.html`),
  fetchText(`${siteUrl}/tools/payment-webhook-test-plan-generator.html`),
  fetchText(`${siteUrl}/tools/webhook-entitlement-decision-matrix.html`),
  fetchText(`${siteUrl}/tools/billing-webhook-debug-cost-calculator.html`),
  fetchText(`${siteUrl}/tools/billing-webhook-launch-readiness-scorecard.html`),
  fetchText(`${siteUrl}/tools/checkout-provider-decision-matrix.html`),
  fetchText(`${siteUrl}/tools/billing-webhook-pro-fit-checker.html`),
  fetchText(`${siteUrl}/tools/lemon-squeezy-checkout-smoke-test-report.html`),
  fetchText(`${siteUrl}/tools/lemon-squeezy-paypal-live-checkout-report.html`),
  fetchText(`${siteUrl}/tools/lemon-squeezy-production-checkout-readiness-report.html`),
  fetchText(`${siteUrl}/tools/lemon-squeezy-fulfillment-checklist-generator.html`),
  fetchText(`${siteUrl}/tools/lemon-squeezy-refund-rollback-report.html`),
  fetchText(`${siteUrl}/tools/lemon-squeezy-delivery-email-template-generator.html`),
  fetchText(`${siteUrl}/tools/lemon-squeezy-webhook-event-coverage-matrix.html`),
  fetchText(`${siteUrl}/guides/`),
  fetchText(`${siteUrl}/guides/lemon-squeezy-checkout-smoke-test.html`),
  fetchText(`${siteUrl}/guides/lemon-squeezy-checkout-404-custom-price-currency.html`),
  fetchText(`${siteUrl}/guides/lemon-squeezy-paypal-checkout-webhook-test.html`),
  fetchText(`${siteUrl}/guides/lemon-squeezy-production-checkout-go-live.html`),
  fetchText(`${siteUrl}/guides/lemon-squeezy-production-webhook-troubleshooting.html`),
  fetchText(`${siteUrl}/guides/nextjs-webhook-405-lemon-squeezy.html`),
  fetchText(`${siteUrl}/guides/lemon-squeezy-webhook-500-vercel-nextjs.html`),
  fetchText(`${siteUrl}/guides/lemon-squeezy-webhook-retry-idempotency.html`),
  fetchText(`${siteUrl}/guides/payment-webhook-test-tool-alternatives.html`),
  fetchText(`${siteUrl}/guides/lemon-squeezy-webhook-not-firing-after-checkout.html`),
  fetchText(`${siteUrl}/guides/lemon-squeezy-digital-download-fulfillment.html`),
  fetchText(`${siteUrl}/guides/lemon-squeezy-refund-webhook-test.html`),
  fetchText(`${siteUrl}/guides/nextjs-payment-webhook-refund-rollback-test.html`),
  fetchText(`${siteUrl}/guides/stripe-webhook-signature-verification-nextjs.html`),
  fetchText(`${siteUrl}/guides/stripe-webhook-test-plan-nextjs.html`),
  fetchText(`${siteUrl}/guides/stripe-refund-webhook-rollback-nextjs.html`),
  fetchText(`${siteUrl}/guides/paddle-webhook-signature-verification-nextjs.html`),
  fetchText(`${siteUrl}/guides/nextjs-paddle-webhook-handler.html`),
  fetchText(`${siteUrl}/guides/paddle-webhook-test-plan-nextjs.html`),
  fetchText(`${siteUrl}/guides/nextjs-payment-webhook-entitlement-test-matrix.html`),
  fetchText(`${siteUrl}/guides/ai-saas-billing-webhook-checklist.html`),
  fetchText(`${siteUrl}/guides/lemon-squeezy-vs-stripe-webhooks-ai-saas.html`),
  fetchText(`${siteUrl}/guides/billing-webhook-kit-pricing-roi.html`),
  fetchText(`${siteUrl}/guides/billing-webhook-kit-buyer-checklist.html`),
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
  ...(proSampleReport.ok
    ? []
    : [`Pro sample report page returned HTTP ${proSampleReport.status ?? "failed"}.`]),
  ...(deliverySupport.ok ? [] : [`delivery support page returned HTTP ${deliverySupport.status ?? "failed"}.`]),
  ...(freeSample.ok ? [] : [`free sample page returned HTTP ${freeSample.status ?? "failed"}.`]),
  ...(statusPage.ok ? [] : [`status page returned HTTP ${statusPage.status ?? "failed"}.`]),
  ...(sitemapHtml.ok ? [] : [`HTML sitemap returned HTTP ${sitemapHtml.status ?? "failed"}.`]),
  ...(searchConsoleHandoff.ok
    ? []
    : [`Search Console sitemap handoff page returned HTTP ${searchConsoleHandoff.status ?? "failed"}.`]),
  ...(troubleshootingHub.ok
    ? []
    : [`troubleshooting hub returned HTTP ${troubleshootingHub.status ?? "failed"}.`]),
  ...(launchEvidencePack.ok
    ? []
    : [`launch evidence pack page returned HTTP ${launchEvidencePack.status ?? "failed"}.`]),
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
  ...(nextjsRawBodyAudit.ok
    ? []
    : [`Next.js raw body audit page returned HTTP ${nextjsRawBodyAudit.status ?? "failed"}.`]),
  ...(vercelLemonSqueezyDebugger.ok
    ? []
    : [`Vercel Lemon Squeezy debugger page returned HTTP ${vercelLemonSqueezyDebugger.status ?? "failed"}.`]),
  ...(paymentWebhookTestPlan.ok
    ? []
    : [`payment webhook test plan generator page returned HTTP ${paymentWebhookTestPlan.status ?? "failed"}.`]),
  ...(entitlementMatrix.ok
    ? []
    : [`entitlement matrix page returned HTTP ${entitlementMatrix.status ?? "failed"}.`]),
  ...(costCalculator.ok
    ? []
    : [`debug cost calculator page returned HTTP ${costCalculator.status ?? "failed"}.`]),
  ...(readinessScorecard.ok
    ? []
    : [`readiness scorecard page returned HTTP ${readinessScorecard.status ?? "failed"}.`]),
  ...(checkoutProviderDecisionMatrix.ok
    ? []
    : [
        `checkout provider decision matrix page returned HTTP ${
          checkoutProviderDecisionMatrix.status ?? "failed"
        }.`
      ]),
  ...(proFitChecker.ok
    ? []
    : [`BillingWebhookKit Pro fit checker page returned HTTP ${proFitChecker.status ?? "failed"}.`]),
  ...(checkoutSmokeReport.ok
    ? []
    : [`checkout smoke test report page returned HTTP ${checkoutSmokeReport.status ?? "failed"}.`]),
  ...(paypalLiveCheckoutReport.ok
    ? []
    : [`PayPal live checkout report page returned HTTP ${paypalLiveCheckoutReport.status ?? "failed"}.`]),
  ...(productionCheckoutReadinessReport.ok
    ? []
    : [
        `production checkout readiness report page returned HTTP ${
          productionCheckoutReadinessReport.status ?? "failed"
        }.`
      ]),
  ...(fulfillmentChecklist.ok
    ? []
    : [`fulfillment checklist generator page returned HTTP ${fulfillmentChecklist.status ?? "failed"}.`]),
  ...(refundRollbackReport.ok
    ? []
    : [`refund rollback report page returned HTTP ${refundRollbackReport.status ?? "failed"}.`]),
  ...(deliveryEmailTemplates.ok
    ? []
    : [`delivery email template generator page returned HTTP ${deliveryEmailTemplates.status ?? "failed"}.`]),
  ...(eventCoverageMatrix.ok
    ? []
    : [`webhook event coverage matrix page returned HTTP ${eventCoverageMatrix.status ?? "failed"}.`]),
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
  ...(productionCheckoutGoLiveGuide.ok
    ? []
    : [
        `Lemon Squeezy production checkout go-live guide returned HTTP ${
          productionCheckoutGoLiveGuide.status ?? "failed"
        }.`
      ]),
  ...(productionWebhookTroubleshootingGuide.ok
    ? []
    : [
        `Lemon Squeezy production webhook troubleshooting guide returned HTTP ${
          productionWebhookTroubleshootingGuide.status ?? "failed"
        }.`
      ]),
  ...(nextjs405Guide.ok
    ? []
    : [`Next.js webhook 405 Lemon Squeezy guide returned HTTP ${nextjs405Guide.status ?? "failed"}.`]),
  ...(webhook500Guide.ok
    ? []
    : [`Lemon Squeezy webhook 500 Vercel guide returned HTTP ${webhook500Guide.status ?? "failed"}.`]),
  ...(retryIdempotencyGuide.ok
    ? []
    : [`Lemon Squeezy webhook retry idempotency guide returned HTTP ${retryIdempotencyGuide.status ?? "failed"}.`]),
  ...(alternativesGuide.ok
    ? []
    : [`Payment webhook test tool alternatives guide returned HTTP ${alternativesGuide.status ?? "failed"}.`]),
  ...(webhookNotFiringGuide.ok
    ? []
    : [`Lemon Squeezy webhook not firing guide returned HTTP ${webhookNotFiringGuide.status ?? "failed"}.`]),
  ...(digitalDownloadGuide.ok
    ? []
    : [`Lemon Squeezy digital download fulfillment guide returned HTTP ${digitalDownloadGuide.status ?? "failed"}.`]),
  ...(refundWebhookGuide.ok
    ? []
    : [`Lemon Squeezy refund webhook guide returned HTTP ${refundWebhookGuide.status ?? "failed"}.`]),
  ...(nextjsRefundRollbackGuide.ok
    ? []
    : [
        `Next.js payment webhook refund rollback guide returned HTTP ${
          nextjsRefundRollbackGuide.status ?? "failed"
        }.`
      ]),
  ...(stripeNextjsGuide.ok
    ? []
    : [`Stripe Next.js signature guide returned HTTP ${stripeNextjsGuide.status ?? "failed"}.`]),
  ...(stripeNextjsTestPlanGuide.ok
    ? []
    : [`Stripe Next.js test plan guide returned HTTP ${stripeNextjsTestPlanGuide.status ?? "failed"}.`]),
  ...(stripeRefundRollbackGuide.ok
    ? []
    : [`Stripe refund rollback guide returned HTTP ${stripeRefundRollbackGuide.status ?? "failed"}.`]),
  ...(paddleNextjsSignatureGuide.ok
    ? []
    : [`Paddle Next.js signature guide returned HTTP ${paddleNextjsSignatureGuide.status ?? "failed"}.`]),
  ...(nextjsPaddleWebhookHandlerGuide.ok
    ? []
    : [`Next.js Paddle webhook handler guide returned HTTP ${nextjsPaddleWebhookHandlerGuide.status ?? "failed"}.`]),
  ...(paddleNextjsTestPlanGuide.ok
    ? []
    : [`Paddle Next.js test plan guide returned HTTP ${paddleNextjsTestPlanGuide.status ?? "failed"}.`]),
  ...(nextjsEntitlementMatrixGuide.ok
    ? []
    : [
        `Next.js payment webhook entitlement matrix guide returned HTTP ${
          nextjsEntitlementMatrixGuide.status ?? "failed"
        }.`
      ]),
  ...(aiSaasBillingWebhookChecklist.ok
    ? []
    : [
        `AI SaaS billing webhook checklist returned HTTP ${
          aiSaasBillingWebhookChecklist.status ?? "failed"
        }.`
      ]),
  ...(lemonSqueezyVsStripeAiSaasGuide.ok
    ? []
    : [
        `Lemon Squeezy vs Stripe AI SaaS guide returned HTTP ${
          lemonSqueezyVsStripeAiSaasGuide.status ?? "failed"
        }.`
      ]),
  ...(pricingRoiGuide.ok
    ? []
    : [`BillingWebhookKit pricing ROI guide returned HTTP ${pricingRoiGuide.status ?? "failed"}.`]),
  ...(buyerChecklistGuide.ok
    ? []
    : [`BillingWebhookKit buyer checklist returned HTTP ${buyerChecklistGuide.status ?? "failed"}.`]),
  ...(sitemap.ok ? [] : [`sitemap returned HTTP ${sitemap.status ?? "failed"}.`]),
  ...(robots.ok ? [] : [`robots.txt returned HTTP ${robots.status ?? "failed"}.`]),
  ...(llms.ok ? [] : [`llms.txt returned HTTP ${llms.status ?? "failed"}.`]),
  ...(checkoutResult.ok ? [] : [`checkout.json returned HTTP ${checkoutResult.status ?? "failed"}.`]),
  ...(sitemapUrls.length >= 75 ? [] : [`sitemap has only ${sitemapUrls.length} URLs; expected at least 75.`]),
  ...requiredSitemapUrls
    .filter((url) => !sitemapUrls.includes(url))
    .map((url) => `sitemap is missing ${url}.`),
  ...(robots.text.includes(`Sitemap: ${siteUrl}/sitemap.xml`) ? [] : ["robots.txt is missing the sitemap directive."]),
  ...(llms.text.includes(`${siteUrl}/pro-kit.html`) ? [] : ["llms.txt is missing the Pro Kit URL."]),
  ...(llms.text.includes(`${siteUrl}/billing-webhook-kit-pro-sample-report.html`)
    ? []
    : ["llms.txt is missing the Pro sample report URL."]),
  ...(llms.text.includes(`${siteUrl}/delivery-refund-support.html`)
    ? []
    : ["llms.txt is missing the delivery, refund, and support policy URL."]),
  ...(llms.text.includes(`${siteUrl}/status.html`) ? [] : ["llms.txt is missing the public status URL."]),
  ...(llms.text.includes(`${siteUrl}/sitemap.html`) ? [] : ["llms.txt is missing the HTML sitemap URL."]),
  ...(llms.text.includes(`${siteUrl}/troubleshooting.html`)
    ? []
    : ["llms.txt is missing the troubleshooting hub URL."]),
  ...(llms.text.includes(`${siteUrl}/billing-webhook-launch-evidence-pack.html`)
    ? []
    : ["llms.txt is missing the launch evidence pack URL."]),
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
  ...(llms.text.includes(`${siteUrl}/tools/nextjs-lemon-squeezy-raw-body-audit.html`)
    ? []
    : ["llms.txt is missing the standalone Next.js Lemon Squeezy raw body audit URL."]),
  ...(llms.text.includes(`${siteUrl}/tools/vercel-lemon-squeezy-webhook-debugger.html`)
    ? []
    : ["llms.txt is missing the standalone Vercel Lemon Squeezy webhook debugger URL."]),
  ...(llms.text.includes(`${siteUrl}/tools/payment-webhook-test-plan-generator.html`)
    ? []
    : ["llms.txt is missing the standalone payment webhook test plan generator URL."]),
  ...(llms.text.includes(`${siteUrl}/tools/webhook-entitlement-decision-matrix.html`)
    ? []
    : ["llms.txt is missing the standalone entitlement matrix URL."]),
  ...(llms.text.includes(`${siteUrl}/tools/billing-webhook-debug-cost-calculator.html`)
    ? []
    : ["llms.txt is missing the standalone debug cost calculator URL."]),
  ...(llms.text.includes(`${siteUrl}/tools/billing-webhook-launch-readiness-scorecard.html`)
    ? []
    : ["llms.txt is missing the standalone launch readiness scorecard URL."]),
  ...(llms.text.includes(`${siteUrl}/tools/checkout-provider-decision-matrix.html`)
    ? []
    : ["llms.txt is missing the standalone checkout provider decision matrix URL."]),
  ...(llms.text.includes(`${siteUrl}/tools/billing-webhook-pro-fit-checker.html`)
    ? []
    : ["llms.txt is missing the standalone BillingWebhookKit Pro fit checker URL."]),
  ...(llms.text.includes(`${siteUrl}/tools/lemon-squeezy-checkout-smoke-test-report.html`)
    ? []
    : ["llms.txt is missing the standalone checkout smoke test report URL."]),
  ...(llms.text.includes(`${siteUrl}/tools/lemon-squeezy-paypal-live-checkout-report.html`)
    ? []
    : ["llms.txt is missing the standalone PayPal live checkout report URL."]),
  ...(llms.text.includes(`${siteUrl}/tools/lemon-squeezy-production-checkout-readiness-report.html`)
    ? []
    : ["llms.txt is missing the standalone production checkout readiness report URL."]),
  ...(llms.text.includes(`${siteUrl}/tools/lemon-squeezy-fulfillment-checklist-generator.html`)
    ? []
    : ["llms.txt is missing the standalone fulfillment checklist generator URL."]),
  ...(llms.text.includes(`${siteUrl}/tools/lemon-squeezy-refund-rollback-report.html`)
    ? []
    : ["llms.txt is missing the standalone refund rollback report URL."]),
  ...(llms.text.includes(`${siteUrl}/tools/lemon-squeezy-delivery-email-template-generator.html`)
    ? []
    : ["llms.txt is missing the standalone delivery email template generator URL."]),
  ...(llms.text.includes(`${siteUrl}/tools/lemon-squeezy-webhook-event-coverage-matrix.html`)
    ? []
    : ["llms.txt is missing the standalone webhook event coverage matrix URL."]),
  ...(llms.text.includes(`${siteUrl}/guides/lemon-squeezy-checkout-smoke-test.html`)
    ? []
    : ["llms.txt is missing the Lemon Squeezy checkout smoke test guide URL."]),
  ...(llms.text.includes(`${siteUrl}/guides/lemon-squeezy-checkout-404-custom-price-currency.html`)
    ? []
    : ["llms.txt is missing the Lemon Squeezy checkout 404 custom price currency guide URL."]),
  ...(llms.text.includes(`${siteUrl}/guides/lemon-squeezy-paypal-checkout-webhook-test.html`)
    ? []
    : ["llms.txt is missing the Lemon Squeezy PayPal checkout webhook test guide URL."]),
  ...(llms.text.includes(`${siteUrl}/guides/lemon-squeezy-production-checkout-go-live.html`)
    ? []
    : ["llms.txt is missing the Lemon Squeezy production checkout go-live guide URL."]),
  ...(llms.text.includes(`${siteUrl}/guides/lemon-squeezy-production-webhook-troubleshooting.html`)
    ? []
    : ["llms.txt is missing the Lemon Squeezy production webhook troubleshooting guide URL."]),
  ...(llms.text.includes(`${siteUrl}/guides/nextjs-webhook-405-lemon-squeezy.html`)
    ? []
    : ["llms.txt is missing the Next.js webhook 405 Lemon Squeezy guide URL."]),
  ...(llms.text.includes(`${siteUrl}/guides/lemon-squeezy-webhook-500-vercel-nextjs.html`)
    ? []
    : ["llms.txt is missing the Lemon Squeezy webhook 500 Vercel guide URL."]),
  ...(llms.text.includes(`${siteUrl}/guides/lemon-squeezy-webhook-retry-idempotency.html`)
    ? []
    : ["llms.txt is missing the Lemon Squeezy webhook retry idempotency guide URL."]),
  ...(llms.text.includes(`${siteUrl}/guides/payment-webhook-test-tool-alternatives.html`)
    ? []
    : ["llms.txt is missing the payment webhook test tool alternatives guide URL."]),
  ...(llms.text.includes(`${siteUrl}/guides/lemon-squeezy-webhook-not-firing-after-checkout.html`)
    ? []
    : ["llms.txt is missing the Lemon Squeezy webhook not firing after checkout guide URL."]),
  ...(llms.text.includes(`${siteUrl}/guides/lemon-squeezy-digital-download-fulfillment.html`)
    ? []
    : ["llms.txt is missing the Lemon Squeezy digital download fulfillment guide URL."]),
  ...(llms.text.includes(`${siteUrl}/guides/lemon-squeezy-refund-webhook-test.html`)
    ? []
    : ["llms.txt is missing the Lemon Squeezy refund webhook test guide URL."]),
  ...(llms.text.includes(`${siteUrl}/guides/stripe-webhook-signature-verification-nextjs.html`)
    ? []
    : ["llms.txt is missing the Stripe Next.js signature guide URL."]),
  ...(llms.text.includes(`${siteUrl}/guides/stripe-webhook-test-plan-nextjs.html`)
    ? []
    : ["llms.txt is missing the Stripe Next.js test plan guide URL."]),
  ...(llms.text.includes(`${siteUrl}/guides/paddle-webhook-signature-verification-nextjs.html`)
    ? []
    : ["llms.txt is missing the Paddle Next.js signature guide URL."]),
  ...(llms.text.includes(`${siteUrl}/guides/nextjs-paddle-webhook-handler.html`)
    ? []
    : ["llms.txt is missing the Next.js Paddle webhook handler guide URL."]),
  ...(llms.text.includes(`${siteUrl}/guides/paddle-webhook-test-plan-nextjs.html`)
    ? []
    : ["llms.txt is missing the Paddle Next.js test plan guide URL."]),
  ...(llms.text.includes(`${siteUrl}/guides/ai-saas-billing-webhook-checklist.html`)
    ? []
    : ["llms.txt is missing the AI SaaS billing webhook checklist URL."]),
  ...(llms.text.includes(`${siteUrl}/guides/lemon-squeezy-vs-stripe-webhooks-ai-saas.html`)
    ? []
    : ["llms.txt is missing the Lemon Squeezy vs Stripe AI SaaS guide URL."]),
  ...(llms.text.includes(`${siteUrl}/guides/billing-webhook-kit-pricing-roi.html`)
    ? []
    : ["llms.txt is missing the BillingWebhookKit pricing ROI guide URL."]),
  ...(llms.text.includes(`${siteUrl}/guides/billing-webhook-kit-buyer-checklist.html`)
    ? []
    : ["llms.txt is missing the BillingWebhookKit buyer checklist URL."]),
  ...(llms.text.includes("Site Health Check workflow")
    ? []
    : ["llms.txt is missing the public Site Health Check signal."]),
  ...(statusPage.text.includes("Checkout, package, and crawlability signals in one place.") &&
  statusPage.text.includes("pro-kit-manifest.json") &&
  statusPage.text.includes("delivery-refund-support.html") &&
  statusPage.text.includes("billing-webhook-kit-pricing-roi.html") &&
  statusPage.text.includes("sitemap.xml") &&
  statusPage.text.includes("sitemap.html") &&
  statusPage.text.includes("Search Console") &&
  statusPage.text.includes("search-console-sitemap-submission.html")
    ? []
    : ["status page is missing checkout, manifest, delivery support, pricing ROI, sitemap, HTML sitemap, or Search Console signals."]),
  ...(sitemapHtml.text.includes("BillingWebhookKit HTML sitemap") &&
  sitemapHtml.text.includes("Core pages and buyer path") &&
  sitemapHtml.text.includes("Browser-only webhook tools") &&
  sitemapHtml.text.includes("Guides and search landing pages") &&
  sitemapHtml.text.includes("checkout-provider-decision-matrix.html") &&
  sitemapHtml.text.includes("troubleshooting.html") &&
  sitemapHtml.text.includes("billing-webhook-kit-pro-sample-report.html") &&
  sitemapHtml.text.includes("lemon-squeezy-vs-stripe-webhooks-ai-saas.html") &&
  sitemapHtml.text.includes("billing-webhook-kit-buyer-checklist.html") &&
  sitemapHtml.text.includes("pro-kit.html") &&
  sitemapHtml.text.includes("sitemap.xml")
    ? []
    : ["HTML sitemap is missing core sections, tool links, guide links, conversion links, or XML sitemap link."]),
  ...(troubleshootingHub.text.includes("Lemon Squeezy Webhook Troubleshooting Hub") &&
  troubleshootingHub.text.includes("Lemon Squeezy webhook not firing after checkout") &&
  troubleshootingHub.text.includes("Lemon Squeezy webhook Vercel 404") &&
  troubleshootingHub.text.includes("Next.js webhook 405") &&
  troubleshootingHub.text.includes("Lemon Squeezy x-signature invalid") &&
  troubleshootingHub.text.includes("lemon-squeezy-checkout-404-custom-price-currency.html") &&
  troubleshootingHub.text.includes("vercel-lemon-squeezy-webhook-debugger.html") &&
  troubleshootingHub.text.includes("nextjs-lemon-squeezy-raw-body-audit.html") &&
  troubleshootingHub.text.includes("lemon-squeezy-production-checkout-readiness-report.html") &&
  troubleshootingHub.text.includes("No API key")
    ? []
    : ["troubleshooting hub is missing symptom copy, target links, or browser-only safety copy."]),
  ...(searchConsoleHandoff.text.includes("Google Search Console sitemap submission") &&
  searchConsoleHandoff.text.includes("URL prefix") &&
  searchConsoleHandoff.text.includes("https://qihaze123.github.io/billing-webhook-kit/") &&
  searchConsoleHandoff.text.includes("sitemap.xml") &&
  searchConsoleHandoff.text.includes("owner actions") &&
  searchConsoleHandoff.text.includes("robots.txt") &&
  searchConsoleHandoff.text.includes("sitemap.html") &&
  searchConsoleHandoff.text.includes("llms.txt")
    ? []
    : ["Search Console sitemap handoff page is missing owner handoff values, crawl files, or manual-boundary copy."]),
  ...(launchEvidencePack.text.includes("Billing webhook launch evidence pack") &&
  launchEvidencePack.text.includes("checkout smoke") &&
  launchEvidencePack.text.includes("production checkout readiness") &&
  launchEvidencePack.text.includes("event coverage") &&
  launchEvidencePack.text.includes("fulfillment proof") &&
  launchEvidencePack.text.includes("refund rollback") &&
  launchEvidencePack.text.includes("delivery email") &&
  launchEvidencePack.text.includes("free-sample.html") &&
  launchEvidencePack.text.includes("pro-kit.html")
    ? []
    : ["launch evidence pack page is missing key evidence steps or conversion links."]),
  ...(proSampleReport.text.includes("BillingWebhookKit Pro Sample Report") &&
  proSampleReport.text.includes("Webhook review report excerpt") &&
  proSampleReport.text.includes("Raw body signature gate") &&
  proSampleReport.text.includes("Duplicate replay") &&
  proSampleReport.text.includes("Entitlement decisions") &&
  proSampleReport.text.includes("CN¥69 Pro Kit") &&
  proSampleReport.text.includes("pro-kit.html") &&
  proSampleReport.text.includes("free-sample.html") &&
  proSampleReport.text.includes("pro-kit-manifest.json")
    ? []
    : ["Pro sample report page is missing sample evidence, price copy, manifest link, or conversion links."]),
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
  toolIndex.text.includes("Checkout and fulfillment launch decision tools") &&
  toolIndex.text.includes("Billing webhook launch evidence pack") &&
  toolIndex.text.includes("Lemon Squeezy production checkout readiness report") &&
  toolIndex.text.includes("Launch lane") &&
  toolIndex.text.includes("Lemon Squeezy webhook payload generator") &&
  toolIndex.text.includes("Lemon Squeezy x-signature verifier") &&
  toolIndex.text.includes("Webhook signature mismatch debugger") &&
  toolIndex.text.includes("Webhook idempotency key generator") &&
  toolIndex.text.includes("Stripe webhook fixture generator") &&
  toolIndex.text.includes("Webhook replay cURL generator") &&
  toolIndex.text.includes("Next.js webhook handler generator") &&
  toolIndex.text.includes("Vercel Lemon Squeezy webhook debugger") &&
  toolIndex.text.includes("vercel-lemon-squeezy-webhook-debugger.html") &&
  toolIndex.text.includes("Webhook entitlement decision matrix") &&
  toolIndex.text.includes("Billing webhook debug cost calculator") &&
  toolIndex.text.includes("Billing webhook launch readiness scorecard") &&
  toolIndex.text.includes("Checkout provider decision matrix") &&
  toolIndex.text.includes("checkout-provider-decision-matrix.html") &&
  toolIndex.text.includes("BillingWebhookKit Pro fit checker") &&
  toolIndex.text.includes("billing-webhook-pro-fit-checker.html") &&
  toolIndex.text.includes("Lemon Squeezy checkout smoke test report") &&
  toolIndex.text.includes("Lemon Squeezy PayPal live checkout report") &&
  toolIndex.text.includes("lemon-squeezy-paypal-live-checkout-report.html") &&
  toolIndex.text.includes("lemon-squeezy-production-checkout-readiness-report.html") &&
  toolIndex.text.includes("Lemon Squeezy fulfillment checklist generator") &&
  toolIndex.text.includes("Lemon Squeezy refund rollback report") &&
  toolIndex.text.includes("Lemon Squeezy delivery email template generator") &&
  toolIndex.text.includes("Lemon Squeezy webhook event coverage matrix") &&
  toolIndex.text.includes("Download the free sample") &&
  toolIndex.text.includes("Preview the CN¥69 Pro Kit")
    ? []
    : ["tool index page is missing tool cards or conversion links."]),
  ...(guideIndex.text.includes("Lemon Squeezy Production Checkout Go-Live Checklist") &&
  guideIndex.text.includes("lemon-squeezy-production-checkout-go-live.html") &&
  guideIndex.text.includes("Fix Next.js 405 for Lemon Squeezy Webhooks") &&
  guideIndex.text.includes("nextjs-webhook-405-lemon-squeezy.html") &&
  guideIndex.text.includes("Fix Lemon Squeezy Webhook 500 on Vercel and Next.js") &&
  guideIndex.text.includes("lemon-squeezy-webhook-500-vercel-nextjs.html") &&
  guideIndex.text.includes("Lemon Squeezy Webhook Retry and Idempotency Guide") &&
  guideIndex.text.includes("lemon-squeezy-webhook-retry-idempotency.html") &&
  guideIndex.text.includes("Payment Webhook Test Tool Alternatives") &&
  guideIndex.text.includes("payment-webhook-test-tool-alternatives.html")
    ? []
    : [
        "guide index is missing the Lemon Squeezy production checkout go-live, Next.js 405, webhook 500, retry idempotency, or alternatives guide."
      ]),
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
  ...(nextjsRawBodyAudit.text.includes("Next.js Lemon Squeezy Raw Body Audit") &&
  nextjsRawBodyAudit.text.includes("request.text()") &&
  nextjsRawBodyAudit.text.includes("x-signature") &&
  nextjsRawBodyAudit.text.includes("Pro sample report") &&
  nextjsRawBodyAudit.text.includes("CN¥69 Pro Kit")
    ? []
    : ["Next.js raw body audit page is missing audit copy, raw-body logic, or conversion links."]),
  ...(vercelLemonSqueezyDebugger.text.includes("Vercel Lemon Squeezy Webhook Debugger") &&
  vercelLemonSqueezyDebugger.text.includes("buildVercelLemonSqueezyWebhookReport") &&
  vercelLemonSqueezyDebugger.text.includes("404") &&
  vercelLemonSqueezyDebugger.text.includes("405") &&
  vercelLemonSqueezyDebugger.text.includes("x-signature") &&
  vercelLemonSqueezyDebugger.text.includes("CN¥69 Pro Kit") &&
  vercelLemonSqueezyDebugger.text.includes("pro-kit.html")
    ? []
    : ["Vercel Lemon Squeezy debugger page is missing diagnostic logic, failure copy, raw-body copy, or conversion links."]),
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
  ...(checkoutProviderDecisionMatrix.text.includes("Checkout Provider Decision Matrix") &&
  checkoutProviderDecisionMatrix.text.includes("buildProviderMatrix") &&
  checkoutProviderDecisionMatrix.text.includes("Lemon Squeezy") &&
  checkoutProviderDecisionMatrix.text.includes("Stripe") &&
  checkoutProviderDecisionMatrix.text.includes("CN¥69 Pro Kit") &&
  checkoutProviderDecisionMatrix.text.includes("pro-kit.html")
    ? []
    : [
        "checkout provider decision matrix page is missing provider comparison logic, Lemon Squeezy, Stripe, Pro Kit, or conversion links."
      ]),
  ...(proFitChecker.text.includes("BillingWebhookKit Pro Fit Checker") &&
  proFitChecker.text.includes("buildFitReport") &&
  proFitChecker.text.includes("CN¥69 Pro Kit") &&
  proFitChecker.text.includes("buyer checklist") &&
  proFitChecker.text.includes("pro-kit.html") &&
  proFitChecker.text.includes("free-sample.html")
    ? []
    : ["BillingWebhookKit Pro fit checker is missing fit logic, price copy, buyer checklist, or conversion links."]),
  ...(checkoutSmokeReport.text.includes("Lemon Squeezy checkout smoke test report") &&
  checkoutSmokeReport.text.includes("buildCheckoutSmokeReport") &&
  checkoutSmokeReport.text.includes("PR-ready checkout smoke test report") &&
  checkoutSmokeReport.text.includes("Preview the CNY 69 Pro Kit")
    ? []
    : ["checkout smoke test report page is missing report copy, report logic, or conversion links."]),
  ...(paypalLiveCheckoutReport.text.includes("Lemon Squeezy PayPal live checkout report") &&
  paypalLiveCheckoutReport.text.includes("buildPayPalLiveCheckoutReport") &&
  paypalLiveCheckoutReport.text.includes("CN¥69") &&
  paypalLiveCheckoutReport.text.includes("PayPal") &&
  paypalLiveCheckoutReport.text.includes("x-signature") &&
  paypalLiveCheckoutReport.text.includes("duplicate replay") &&
  paypalLiveCheckoutReport.text.includes("private delivery") &&
  paypalLiveCheckoutReport.text.includes("refund rollback") &&
  paypalLiveCheckoutReport.text.includes("pro-kit.html") &&
  paypalLiveCheckoutReport.text.includes("lemon-squeezy-production-checkout-readiness-report.html")
    ? []
    : ["PayPal live checkout report page is missing report copy, report logic, launch safety copy, or conversion links."]),
  ...(productionCheckoutReadinessReport.text.includes("Lemon Squeezy production checkout readiness report") &&
  productionCheckoutReadinessReport.text.includes("buildReport") &&
  productionCheckoutReadinessReport.text.includes("CN¥69") &&
  productionCheckoutReadinessReport.text.includes("PayPal checkout") &&
  productionCheckoutReadinessReport.text.includes("duplicate replay") &&
  productionCheckoutReadinessReport.text.includes("private delivery") &&
  productionCheckoutReadinessReport.text.includes("refund rollback") &&
  productionCheckoutReadinessReport.text.includes("pro-kit.html") &&
  productionCheckoutReadinessReport.text.includes("billing-webhook-launch-evidence-pack.html")
    ? []
    : [
        "production checkout readiness report page is missing report logic, checkout readiness copy, safety copy, or conversion links."
      ]),
  ...(fulfillmentChecklist.text.includes("Lemon Squeezy fulfillment checklist generator") &&
  fulfillmentChecklist.text.includes("buildFulfillmentReport") &&
  fulfillmentChecklist.text.includes("private ZIP") &&
  fulfillmentChecklist.text.includes("x-signature") &&
  fulfillmentChecklist.text.includes("idempotency") &&
  fulfillmentChecklist.text.includes("checksum") &&
  fulfillmentChecklist.text.includes("support policy") &&
  fulfillmentChecklist.text.includes("Preview the CNY 69 Pro Kit")
    ? []
    : ["fulfillment checklist generator page is missing report copy, report logic, delivery safety copy, or conversion links."]),
  ...(refundRollbackReport.text.includes("Lemon Squeezy refund rollback report generator") &&
  refundRollbackReport.text.includes("buildRefundRollbackReport") &&
  refundRollbackReport.text.includes("entitlement rollback") &&
  refundRollbackReport.text.includes("duplicate replay") &&
  refundRollbackReport.text.includes("secret-free") &&
  refundRollbackReport.text.includes("pro-kit.html") &&
  refundRollbackReport.text.includes("free-sample.html") &&
  refundRollbackReport.text.includes("lemon-squeezy-refund-webhook-test.html")
    ? []
    : ["refund rollback report page is missing report logic, rollback copy, replay safety copy, or conversion links."]),
  ...(deliveryEmailTemplates.text.includes("Lemon Squeezy delivery email template generator") &&
  deliveryEmailTemplates.text.includes("buildDeliveryEmailTemplates") &&
  deliveryEmailTemplates.text.includes("private ZIP") &&
  deliveryEmailTemplates.text.includes("checksum") &&
  deliveryEmailTemplates.text.includes("support policy") &&
  deliveryEmailTemplates.text.includes("refund") &&
  deliveryEmailTemplates.text.includes("pro-kit.html") &&
  deliveryEmailTemplates.text.includes("free-sample.html") &&
  deliveryEmailTemplates.text.includes("lemon-squeezy-fulfillment-checklist-generator.html")
    ? []
    : ["delivery email template generator page is missing template logic, delivery safety copy, policy copy, or conversion links."]),
  ...(paymentWebhookTestPlan.text.includes("Payment Webhook Test Plan Generator") &&
  paymentWebhookTestPlan.text.includes("buildPlan") &&
  paymentWebhookTestPlan.text.includes("Raw-body signature verification") &&
  paymentWebhookTestPlan.text.includes("Duplicate replay test") &&
  paymentWebhookTestPlan.text.includes("Entitlement decision matrix") &&
  paymentWebhookTestPlan.text.includes("Checkout-to-webhook smoke test") &&
  paymentWebhookTestPlan.text.includes("Lemon Squeezy") &&
  paymentWebhookTestPlan.text.includes("Stripe") &&
  paymentWebhookTestPlan.text.includes("Paddle") &&
  paymentWebhookTestPlan.text.includes("Polar") &&
  paymentWebhookTestPlan.text.includes("Preview the CN¥69 Pro Kit") &&
  paymentWebhookTestPlan.text.includes("free-sample.html")
    ? []
    : ["payment webhook test plan generator page is missing plan logic, provider coverage, launch gates, or conversion links."]),
  ...(eventCoverageMatrix.text.includes("Lemon Squeezy webhook event coverage matrix") &&
  eventCoverageMatrix.text.includes("buildEventCoverageMatrix") &&
  eventCoverageMatrix.text.includes("order_created") &&
  eventCoverageMatrix.text.includes("subscription_created") &&
  eventCoverageMatrix.text.includes("license_key_created") &&
  eventCoverageMatrix.text.includes("x-signature") &&
  eventCoverageMatrix.text.includes("idempotency") &&
  eventCoverageMatrix.text.includes("duplicate replay") &&
  eventCoverageMatrix.text.includes("Preview the CNY 69 Pro Kit") &&
  eventCoverageMatrix.text.includes("lemon-squeezy-webhook-payload-generator.html")
    ? []
    : ["webhook event coverage matrix page is missing matrix logic, event coverage copy, safety copy, or conversion links."]),
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
  ...(productionCheckoutGoLiveGuide.text.includes("Lemon Squeezy production checkout go-live checklist") &&
  productionCheckoutGoLiveGuide.text.includes("CN¥69") &&
  productionCheckoutGoLiveGuide.text.includes("PayPal checkout") &&
  productionCheckoutGoLiveGuide.text.includes("signed paid webhooks") &&
  productionCheckoutGoLiveGuide.text.includes("duplicate replay") &&
  productionCheckoutGoLiveGuide.text.includes("private delivery") &&
  productionCheckoutGoLiveGuide.text.includes("refund rollback") &&
  productionCheckoutGoLiveGuide.text.includes("lemon-squeezy-production-checkout-readiness-report.html") &&
  productionCheckoutGoLiveGuide.text.includes("pro-kit.html")
    ? []
    : [
        "Lemon Squeezy production checkout go-live guide is missing live checkout, price, PayPal, replay, delivery, refund, report, or conversion copy."
      ]),
  ...(productionWebhookTroubleshootingGuide.text.includes("Lemon Squeezy production webhook troubleshooting checklist") &&
  productionWebhookTroubleshootingGuide.text.includes("paid order_created") &&
  productionWebhookTroubleshootingGuide.text.includes("x-signature") &&
  productionWebhookTroubleshootingGuide.text.includes("duplicate replay") &&
  productionWebhookTroubleshootingGuide.text.includes("private fulfillment") &&
  productionWebhookTroubleshootingGuide.text.includes("refund rollback") &&
  productionWebhookTroubleshootingGuide.text.includes("lemon-squeezy-production-checkout-readiness-report.html") &&
  productionWebhookTroubleshootingGuide.text.includes("pro-kit.html")
    ? []
    : [
        "Lemon Squeezy production webhook troubleshooting guide is missing paid event, signature, replay, fulfillment, refund, report, or conversion copy."
      ]),
  ...(nextjs405Guide.text.includes("Fix Next.js 405 for Lemon Squeezy Webhooks") &&
  nextjs405Guide.text.includes("Method Not Allowed") &&
  nextjs405Guide.text.includes("export async function POST") &&
  nextjs405Guide.text.includes("request.text()") &&
  nextjs405Guide.text.includes("curl -i -X POST") &&
  nextjs405Guide.text.includes("x-signature") &&
  nextjs405Guide.text.includes("duplicate replay") &&
  nextjs405Guide.text.includes("vercel-lemon-squeezy-webhook-debugger.html") &&
  nextjs405Guide.text.includes("pro-kit.html") &&
  nextjs405Guide.text.includes("Never paste Lemon Squeezy API keys")
    ? []
    : ["Next.js webhook 405 Lemon Squeezy guide is missing method, POST export, raw-body, cURL, replay, safety, or conversion copy."]),
  ...(webhook500Guide.text.includes("Fix Lemon Squeezy Webhook 500 on Vercel and Next.js") &&
  webhook500Guide.text.includes("missing env vars") &&
  webhook500Guide.text.includes("timingSafeEqual") &&
  webhook500Guide.text.includes("request.text()") &&
  webhook500Guide.text.includes("Retryable fulfillment failure") &&
  webhook500Guide.text.includes("duplicate replay") &&
  webhook500Guide.text.includes("vercel-lemon-squeezy-webhook-debugger.html") &&
  webhook500Guide.text.includes("lemon-squeezy-production-checkout-readiness-report.html") &&
  webhook500Guide.text.includes("pro-kit.html") &&
  webhook500Guide.text.includes("Never paste Lemon Squeezy API keys")
    ? []
    : ["Lemon Squeezy webhook 500 Vercel guide is missing env, timingSafeEqual, raw-body, retry, replay, safety, or conversion copy."]),
  ...(retryIdempotencyGuide.text.includes("Lemon Squeezy Webhook Retry and Idempotency Guide") &&
  retryIdempotencyGuide.text.includes("Duplicate webhook delivery") &&
  retryIdempotencyGuide.text.includes("lemonsqueezy:order_created:order_id") &&
  retryIdempotencyGuide.text.includes("Return 2xx for safe duplicates") &&
  retryIdempotencyGuide.text.includes("Return 500 only for retryable fulfillment") &&
  retryIdempotencyGuide.text.includes("webhook-idempotency-key-generator.html") &&
  retryIdempotencyGuide.text.includes("lemon-squeezy-production-checkout-readiness-report.html") &&
  retryIdempotencyGuide.text.includes("pro-kit.html") &&
  retryIdempotencyGuide.text.includes("Never paste Lemon Squeezy API keys")
    ? []
    : [
        "Lemon Squeezy webhook retry idempotency guide is missing duplicate delivery, process-once, status-code, conversion, or safety copy."
      ]),
  ...(alternativesGuide.text.includes("Payment Webhook Test Tool Alternatives") &&
  alternativesGuide.text.includes("webhook inboxes") &&
  alternativesGuide.text.includes("Provider CLIs") &&
  alternativesGuide.text.includes("Manual JSON fixtures") &&
  alternativesGuide.text.includes("BillingWebhookKit free path") &&
  alternativesGuide.text.includes("BillingWebhookKit Pro") &&
  alternativesGuide.text.includes("CN¥69") &&
  alternativesGuide.text.includes("billing-webhook-kit-pricing-roi.html") &&
  alternativesGuide.text.includes("pro-kit.html")
    ? []
    : ["Payment webhook test tool alternatives guide is missing comparison, provider-tooling, free-path, Pro Kit, price, or conversion copy."]),
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
  ...(refundWebhookGuide.text.includes("Lemon Squeezy refund webhook test") &&
  refundWebhookGuide.text.includes("entitlement rollback") &&
  refundWebhookGuide.text.includes("duplicate replay") &&
  refundWebhookGuide.text.includes("secret-free") &&
  refundWebhookGuide.text.includes("delivery-refund-support.html") &&
  refundWebhookGuide.text.includes("pro-kit.html") &&
  refundWebhookGuide.text.includes("free-sample.html")
    ? []
    : ["Lemon Squeezy refund webhook guide is missing refund rollback, replay, safety, policy, or conversion copy."]),
  ...(nextjsRefundRollbackGuide.text.includes("Next.js payment webhook refund rollback test") &&
  nextjsRefundRollbackGuide.text.includes("signed fixtures") &&
  nextjsRefundRollbackGuide.text.includes("entitlement revocation") &&
  nextjsRefundRollbackGuide.text.includes("support evidence") &&
  nextjsRefundRollbackGuide.text.includes("duplicate replay") &&
  nextjsRefundRollbackGuide.text.includes("lemon-squeezy-refund-rollback-report.html") &&
  nextjsRefundRollbackGuide.text.includes("nextjs-payment-webhook-entitlement-test-matrix.html") &&
  nextjsRefundRollbackGuide.text.includes("pro-kit.html")
    ? []
    : [
        "Next.js payment webhook refund rollback guide is missing signed fixture, rollback, replay, support, or conversion copy."
      ]),
  ...(stripeNextjsGuide.text.includes("Stripe webhook signature verification in Next.js") &&
  stripeNextjsGuide.text.includes("request.text()") &&
  stripeNextjsGuide.text.includes("Stripe-Signature") &&
  stripeNextjsGuide.text.includes("View Pro Kit preview")
    ? []
    : ["Stripe Next.js signature guide is missing raw-body copy, Stripe signature copy, or conversion links."]),
  ...(stripeNextjsTestPlanGuide.text.includes("Stripe webhook test plan for Next.js") &&
  stripeNextjsTestPlanGuide.text.includes("checkout.session.completed") &&
  stripeNextjsTestPlanGuide.text.includes("invoice.paid") &&
  stripeNextjsTestPlanGuide.text.includes("customer.subscription.deleted") &&
  stripeNextjsTestPlanGuide.text.includes("charge.refunded") &&
  stripeNextjsTestPlanGuide.text.includes("request.text()") &&
  stripeNextjsTestPlanGuide.text.includes("duplicate replay") &&
  stripeNextjsTestPlanGuide.text.includes("payment-webhook-test-plan-generator.html") &&
  stripeNextjsTestPlanGuide.text.includes("stripe-webhook-fixture-generator.html") &&
  stripeNextjsTestPlanGuide.text.includes("pro-kit.html")
    ? []
    : ["Stripe Next.js test plan guide is missing test plan copy, Stripe event coverage, raw-body copy, or conversion links."]),
  ...(stripeRefundRollbackGuide.text.includes("Stripe refund webhook rollback in Next.js") &&
  stripeRefundRollbackGuide.text.includes("charge.refunded") &&
  stripeRefundRollbackGuide.text.includes("refund.created") &&
  stripeRefundRollbackGuide.text.includes("Stripe-Signature") &&
  stripeRefundRollbackGuide.text.includes("duplicate replay") &&
  stripeRefundRollbackGuide.text.includes("stripe-webhook-fixture-generator.html") &&
  stripeRefundRollbackGuide.text.includes("nextjs-payment-webhook-refund-rollback-test.html") &&
  stripeRefundRollbackGuide.text.includes("pro-kit.html")
    ? []
    : [
        "Stripe refund rollback guide is missing Stripe event coverage, signature copy, replay copy, or conversion links."
      ]),
  ...(paddleNextjsSignatureGuide.text.includes("Paddle webhook signature verification in Next.js") &&
  paddleNextjsSignatureGuide.text.includes("Paddle-Signature") &&
  paddleNextjsSignatureGuide.text.includes("transaction.completed") &&
  paddleNextjsSignatureGuide.text.includes("subscription lifecycle") &&
  paddleNextjsSignatureGuide.text.includes("request.text()") &&
  paddleNextjsSignatureGuide.text.includes("duplicate replay") &&
  paddleNextjsSignatureGuide.text.includes("payment-webhook-test-plan-generator.html") &&
  paddleNextjsSignatureGuide.text.includes("paddle-webhook-test-plan-nextjs.html") &&
  paddleNextjsSignatureGuide.text.includes("pro-kit.html")
    ? []
    : ["Paddle Next.js signature guide is missing signature copy, Paddle event coverage, raw-body copy, or conversion links."]),
  ...(nextjsPaddleWebhookHandlerGuide.text.includes("Next.js Paddle webhook handler") &&
  nextjsPaddleWebhookHandlerGuide.text.includes("Paddle-Signature") &&
  nextjsPaddleWebhookHandlerGuide.text.includes("transaction.completed") &&
  nextjsPaddleWebhookHandlerGuide.text.includes("subscription lifecycle") &&
  nextjsPaddleWebhookHandlerGuide.text.includes("request.text()") &&
  nextjsPaddleWebhookHandlerGuide.text.includes("duplicate replay") &&
  nextjsPaddleWebhookHandlerGuide.text.includes("nextjs-webhook-handler-generator.html") &&
  nextjsPaddleWebhookHandlerGuide.text.includes("paddle-webhook-signature-verification-nextjs.html") &&
  nextjsPaddleWebhookHandlerGuide.text.includes("pro-kit.html")
    ? []
    : ["Next.js Paddle webhook handler guide is missing handler copy, Paddle event coverage, raw-body copy, or conversion links."]),
  ...(paddleNextjsTestPlanGuide.text.includes("Paddle webhook test plan for Next.js") &&
  paddleNextjsTestPlanGuide.text.includes("Paddle-Signature") &&
  paddleNextjsTestPlanGuide.text.includes("transaction.completed") &&
  paddleNextjsTestPlanGuide.text.includes("subscription lifecycle") &&
  paddleNextjsTestPlanGuide.text.includes("request.text()") &&
  paddleNextjsTestPlanGuide.text.includes("duplicate replay") &&
  paddleNextjsTestPlanGuide.text.includes("payment-webhook-test-plan-generator.html") &&
  paddleNextjsTestPlanGuide.text.includes("paddle-webhook-test-payload.html") &&
  paddleNextjsTestPlanGuide.text.includes("pro-kit.html")
    ? []
    : ["Paddle Next.js test plan guide is missing test plan copy, Paddle event coverage, raw-body copy, or conversion links."]),
  ...(nextjsEntitlementMatrixGuide.text.includes("Next.js payment webhook entitlement test matrix") &&
  nextjsEntitlementMatrixGuide.text.includes("paid checkout") &&
  nextjsEntitlementMatrixGuide.text.includes("failed payment") &&
  nextjsEntitlementMatrixGuide.text.includes("refund") &&
  nextjsEntitlementMatrixGuide.text.includes("duplicate replay") &&
  nextjsEntitlementMatrixGuide.text.includes("unknown events") &&
  nextjsEntitlementMatrixGuide.text.includes("webhook-entitlement-decision-matrix.html") &&
  nextjsEntitlementMatrixGuide.text.includes("payment-webhook-test-plan-generator.html") &&
  nextjsEntitlementMatrixGuide.text.includes("pro-kit.html")
    ? []
    : [
        "Next.js payment webhook entitlement matrix guide is missing entitlement copy, replay coverage, or conversion links."
      ]),
  ...(aiSaasBillingWebhookChecklist.text.includes("AI SaaS billing webhook checklist") &&
  aiSaasBillingWebhookChecklist.text.includes("AI-generated SaaS") &&
  aiSaasBillingWebhookChecklist.text.includes("raw-body") &&
  aiSaasBillingWebhookChecklist.text.includes("duplicate replay") &&
  aiSaasBillingWebhookChecklist.text.includes("checkout smoke") &&
  aiSaasBillingWebhookChecklist.text.includes("CN¥69 Pro Kit") &&
  aiSaasBillingWebhookChecklist.text.includes("pro-kit.html")
    ? []
    : [
        "AI SaaS billing webhook checklist is missing AI SaaS, raw-body, replay, checkout smoke, Pro Kit, or conversion copy."
      ]),
  ...(lemonSqueezyVsStripeAiSaasGuide.text.includes("Lemon Squeezy vs Stripe webhooks for AI SaaS") &&
  lemonSqueezyVsStripeAiSaasGuide.text.includes("Lemon Squeezy webhook focus") &&
  lemonSqueezyVsStripeAiSaasGuide.text.includes("Stripe webhook focus") &&
  lemonSqueezyVsStripeAiSaasGuide.text.includes("Signature gate") &&
  lemonSqueezyVsStripeAiSaasGuide.text.includes("Checkout smoke") &&
  lemonSqueezyVsStripeAiSaasGuide.text.includes("CN¥69 Pro Kit") &&
  lemonSqueezyVsStripeAiSaasGuide.text.includes("pro-kit.html")
    ? []
    : [
        "Lemon Squeezy vs Stripe AI SaaS guide is missing provider comparison, signature, checkout smoke, Pro Kit, or conversion copy."
      ]),
  ...(pricingRoiGuide.text.includes("Is BillingWebhookKit worth CN¥69?") &&
  pricingRoiGuide.text.includes("free browser tools") &&
  pricingRoiGuide.text.includes("Pro Kit") &&
  pricingRoiGuide.text.includes("duplicate replay") &&
  pricingRoiGuide.text.includes("break-even") &&
  pricingRoiGuide.text.includes("billing-webhook-debug-cost-calculator.html") &&
  pricingRoiGuide.text.includes("pro-kit.html")
    ? []
    : [
        "BillingWebhookKit pricing ROI guide is missing price, free path, Pro Kit, replay, break-even, calculator, or conversion copy."
      ]),
  ...(buyerChecklistGuide.text.includes("Check this before buying BillingWebhookKit Pro.") &&
  buyerChecklistGuide.text.includes("CN¥69 one-time") &&
  buyerChecklistGuide.text.includes("Use the free path") &&
  buyerChecklistGuide.text.includes("Pro becomes reasonable") &&
  buyerChecklistGuide.text.includes("pro-kit-manifest.json") &&
  buyerChecklistGuide.text.includes("delivery-refund-support.html") &&
  buyerChecklistGuide.text.includes("billing-webhook-debug-cost-calculator.html") &&
  buyerChecklistGuide.text.includes("pro-kit.html")
    ? []
    : [
        "BillingWebhookKit buyer checklist is missing price, free path, Pro Kit decision copy, public artifacts, or conversion links."
      ]),
  ...(home.text.includes("Automated site health checks")
    ? []
    : ["homepage is missing the automated site health trust signal."]),
  ...(home.text.includes("delivery-refund-support.html")
    ? []
    : ["homepage is missing the delivery, refund, and support policy link."]),
  ...(home.text.includes("billing-webhook-launch-evidence-pack.html")
    ? []
    : ["homepage is missing the launch evidence pack link."]),
  ...(home.text.includes("billing-webhook-kit-pro-sample-report.html")
    ? []
    : ["homepage is missing the Pro sample report link."]),
  ...(home.text.includes("billing-webhook-kit-buyer-checklist.html")
    ? []
    : ["homepage static discovery content is missing the buyer checklist link."]),
  ...(home.text.includes("lemon-squeezy-production-checkout-readiness-report.html")
    ? []
    : ["homepage is missing the production checkout readiness report link."]),
  ...(home.text.includes("lemon-squeezy-paypal-live-checkout-report.html")
    ? []
    : ["homepage is missing the PayPal live checkout report link."]),
  ...(home.text.includes("lemon-squeezy-checkout-smoke-test.html") &&
  home.text.includes("lemon-squeezy-checkout-404-custom-price-currency.html") &&
  home.text.includes("lemon-squeezy-paypal-checkout-webhook-test.html") &&
  home.text.includes("lemon-squeezy-production-checkout-go-live.html")
    ? []
    : ["homepage is missing checkout launch guide links in static discovery content."]),
  ...(proKit.text.includes("Buy it when the free sample stops being enough")
    ? []
    : ["Pro Kit page is missing the buying-decision section."]),
  ...(proKit.text.includes("delivery-refund-support.html") &&
  proKit.text.includes("support and refund") &&
  proKit.text.includes("billing-webhook-launch-evidence-pack.html") &&
  proKit.text.includes("billing-webhook-kit-pro-sample-report.html") &&
  proKit.text.includes("billing-webhook-kit-pricing-roi.html") &&
  proKit.text.includes("billing-webhook-kit-buyer-checklist.html") &&
  proKit.text.includes("ai-saas-billing-webhook-checklist.html")
    ? []
    : ["Pro Kit page is missing delivery, support, refund policy, pricing ROI, buyer checklist, sample report, AI SaaS checklist, or launch evidence links."]),
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
  freeSample.text.includes("delivery-refund-support.html") &&
  freeSample.text.includes("billing-webhook-launch-evidence-pack.html") &&
  freeSample.text.includes("billing-webhook-kit-pro-sample-report.html") &&
  freeSample.text.includes("billing-webhook-kit-pricing-roi.html") &&
  freeSample.text.includes("billing-webhook-kit-buyer-checklist.html") &&
  freeSample.text.includes("ai-saas-billing-webhook-checklist.html")
    ? []
    : ["Free sample page is missing the Pro Kit upgrade path, launch evidence pack, sample report, pricing ROI, buyer checklist, AI SaaS checklist, delivery policy, or verification links."]),
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
    proSampleReport: proSampleReport.status,
    deliverySupport: deliverySupport.status,
    freeSample: freeSample.status,
    statusPage: statusPage.status,
    sitemapHtml: sitemapHtml.status,
    searchConsoleHandoff: searchConsoleHandoff.status,
    launchEvidencePack: launchEvidencePack.status,
    toolIndex: toolIndex.status,
    signatureVerifier: signatureVerifier.status,
    payloadGenerator: payloadGenerator.status,
    mismatchDebugger: mismatchDebugger.status,
    idempotencyGenerator: idempotencyGenerator.status,
    stripeGenerator: stripeGenerator.status,
    replayGenerator: replayGenerator.status,
    nextjsGenerator: nextjsGenerator.status,
    nextjsRawBodyAudit: nextjsRawBodyAudit.status,
    vercelLemonSqueezyDebugger: vercelLemonSqueezyDebugger.status,
    paymentWebhookTestPlan: paymentWebhookTestPlan.status,
    entitlementMatrix: entitlementMatrix.status,
    costCalculator: costCalculator.status,
    readinessScorecard: readinessScorecard.status,
    checkoutProviderDecisionMatrix: checkoutProviderDecisionMatrix.status,
    proFitChecker: proFitChecker.status,
    checkoutSmokeReport: checkoutSmokeReport.status,
    paypalLiveCheckoutReport: paypalLiveCheckoutReport.status,
    productionCheckoutReadinessReport: productionCheckoutReadinessReport.status,
    fulfillmentChecklist: fulfillmentChecklist.status,
    refundRollbackReport: refundRollbackReport.status,
    deliveryEmailTemplates: deliveryEmailTemplates.status,
    eventCoverageMatrix: eventCoverageMatrix.status,
    checkoutSmokeGuide: checkoutSmokeGuide.status,
    checkout404Guide: checkout404Guide.status,
    paypalCheckoutGuide: paypalCheckoutGuide.status,
    productionCheckoutGoLiveGuide: productionCheckoutGoLiveGuide.status,
    productionWebhookTroubleshootingGuide: productionWebhookTroubleshootingGuide.status,
    nextjs405Guide: nextjs405Guide.status,
    webhook500Guide: webhook500Guide.status,
    retryIdempotencyGuide: retryIdempotencyGuide.status,
    alternativesGuide: alternativesGuide.status,
    webhookNotFiringGuide: webhookNotFiringGuide.status,
    digitalDownloadGuide: digitalDownloadGuide.status,
    refundWebhookGuide: refundWebhookGuide.status,
    nextjsRefundRollbackGuide: nextjsRefundRollbackGuide.status,
    stripeNextjsGuide: stripeNextjsGuide.status,
    stripeNextjsTestPlanGuide: stripeNextjsTestPlanGuide.status,
    stripeRefundRollbackGuide: stripeRefundRollbackGuide.status,
    paddleNextjsSignatureGuide: paddleNextjsSignatureGuide.status,
    nextjsPaddleWebhookHandlerGuide: nextjsPaddleWebhookHandlerGuide.status,
    paddleNextjsTestPlanGuide: paddleNextjsTestPlanGuide.status,
    nextjsEntitlementMatrixGuide: nextjsEntitlementMatrixGuide.status,
    aiSaasBillingWebhookChecklist: aiSaasBillingWebhookChecklist.status,
    lemonSqueezyVsStripeAiSaasGuide: lemonSqueezyVsStripeAiSaasGuide.status,
    pricingRoiGuide: pricingRoiGuide.status,
    buyerChecklistGuide: buyerChecklistGuide.status,
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
