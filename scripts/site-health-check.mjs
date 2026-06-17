const siteUrl = "https://qihaze123.github.io/billing-webhook-kit";
const expectedPriceCents = 6900;
const expectedCurrencyPolicy = "inherit_store_or_variant_currency";
const requiredSitemapUrls = [
  `${siteUrl}/`,
  `${siteUrl}/guides/`,
  `${siteUrl}/free-sample.html`,
  `${siteUrl}/pro-kit.html`,
  `${siteUrl}/guides/lemon-squeezy-webhook-test.html`,
  `${siteUrl}/guides/lemon-squeezy-webhook-raw-body-nextjs.html`,
  `${siteUrl}/guides/lemon-squeezy-x-signature-invalid.html`,
  `${siteUrl}/guides/lemon-squeezy-order-created-fixture.html`,
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

const [home, proKit, freeSample, guideIndex, sitemap, robots, llms, checkoutResult] = await Promise.all([
  fetchText(`${siteUrl}/`),
  fetchText(`${siteUrl}/pro-kit.html`),
  fetchText(`${siteUrl}/free-sample.html`),
  fetchText(`${siteUrl}/guides/`),
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
  ...(freeSample.ok ? [] : [`free sample page returned HTTP ${freeSample.status ?? "failed"}.`]),
  ...(guideIndex.ok ? [] : [`guide index returned HTTP ${guideIndex.status ?? "failed"}.`]),
  ...(sitemap.ok ? [] : [`sitemap returned HTTP ${sitemap.status ?? "failed"}.`]),
  ...(robots.ok ? [] : [`robots.txt returned HTTP ${robots.status ?? "failed"}.`]),
  ...(llms.ok ? [] : [`llms.txt returned HTTP ${llms.status ?? "failed"}.`]),
  ...(checkoutResult.ok ? [] : [`checkout.json returned HTTP ${checkoutResult.status ?? "failed"}.`]),
  ...(sitemapUrls.length >= 36 ? [] : [`sitemap has only ${sitemapUrls.length} URLs; expected at least 36.`]),
  ...requiredSitemapUrls
    .filter((url) => !sitemapUrls.includes(url))
    .map((url) => `sitemap is missing ${url}.`),
  ...(robots.text.includes(`Sitemap: ${siteUrl}/sitemap.xml`) ? [] : ["robots.txt is missing the sitemap directive."]),
  ...(llms.text.includes(`${siteUrl}/pro-kit.html`) ? [] : ["llms.txt is missing the Pro Kit URL."]),
  ...(llms.text.includes("Site Health Check workflow")
    ? []
    : ["llms.txt is missing the public Site Health Check signal."]),
  ...(home.text.includes("Automated site health checks")
    ? []
    : ["homepage is missing the automated site health trust signal."]),
  ...(proKit.text.includes("Buy it when the free sample stops being enough")
    ? []
    : ["Pro Kit page is missing the buying-decision section."]),
  ...((proKit.text.match(/class="decision-item"/g) || []).length === 3
    ? []
    : ["Pro Kit page does not expose 3 buying-decision cards."]),
  ...((proKit.text.match(/"@type": "Question"/g) || []).length >= 7
    ? []
    : ["Pro Kit page exposes fewer than 7 FAQ schema questions."]),
  ...(freeSample.text.includes("Free sample to Pro Kit upgrade path") &&
  freeSample.text.includes("pro-kit.html") &&
  freeSample.text.includes("pro-kit-manifest.json")
    ? []
    : ["Free sample page is missing the Pro Kit upgrade path or verification links."]),
  ...checkoutEvaluation.issues.map((issue) => `checkout: ${issue}`)
];

const result = {
  ok: issues.length === 0,
  checkedAt: new Date().toISOString(),
  siteUrl,
  pages: {
    home: home.status,
    proKit: proKit.status,
    freeSample: freeSample.status,
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
