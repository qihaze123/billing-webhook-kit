# BillingWebhookKit

Browser-only payment webhook fixture generator, raw-body signature verifier, payload inspector, and review report exporter for SaaS billing integrations.

Live tool: https://qihaze123.github.io/billing-webhook-kit/

Free sample: https://qihaze123.github.io/billing-webhook-kit/free-sample.html

![BillingWebhookKit browser-only webhook fixture generator](public/product-screenshot.png)

The free tool generates Lemon Squeezy webhook payloads, verifies HMAC signatures against exact raw request bodies, inspects trusted billing fields, recommends idempotency keys, exports PR-ready Markdown review reports, creates cURL replay commands, and provides starter handlers for Next.js, Hono, and Express. It is designed for local billing integration tests, CI fixtures, and webhook replay debugging.

## What It Helps Test

- Lemon Squeezy `order_created` and subscription events
- HMAC SHA-256 webhook signature verification
- Received `x-signature` headers against exact raw request bodies
- Payload inspection for event name, object ID, customer, status, amount, and target record
- Recommended idempotency keys for safe webhook retries
- PR-ready Markdown reports for webhook route review and release checklists
- cURL webhook replay into local, tunnel, staging, or CI routes
- Next.js, Hono, and Express raw-body handler patterns
- Billing webhook idempotency and retry behavior

## Pro Kit

The paid Pro Kit launch price is CN¥69 and adds copy-ready billing webhook assets:

- Lemon Squeezy fixture library
- Stripe, Paddle, and Polar starter fixtures
- Next.js, Hono, Express, and Cloudflare Workers route templates
- Vitest signature verification tests
- GitHub Actions billing webhook CI checks
- Webhook review report templates and release checklist notes
- Integration checklist and replay notes

Preview page: https://qihaze123.github.io/billing-webhook-kit/pro-kit.html

Free sample pack: https://qihaze123.github.io/billing-webhook-kit/free-sample.html

## Guides

- https://qihaze123.github.io/billing-webhook-kit/guides/lemon-squeezy-webhook-test.html
- https://qihaze123.github.io/billing-webhook-kit/guides/lemon-squeezy-webhook-signature.html
- https://qihaze123.github.io/billing-webhook-kit/guides/payment-webhook-ci-tests.html
- https://qihaze123.github.io/billing-webhook-kit/guides/webhook-idempotency-checklist.html
- https://qihaze123.github.io/billing-webhook-kit/guides/webhook-review-checklist.html
- https://qihaze123.github.io/billing-webhook-kit/guides/saas-billing-webhook-test-plan.html
- https://qihaze123.github.io/billing-webhook-kit/guides/lemon-squeezy-webhook-fixtures.html
- https://qihaze123.github.io/billing-webhook-kit/guides/payment-webhook-test-generator.html
- https://qihaze123.github.io/billing-webhook-kit/guides/billing-webhook-starter-kit.html
- https://qihaze123.github.io/billing-webhook-kit/guides/nextjs-billing-webhook-test-suite.html
- https://qihaze123.github.io/billing-webhook-kit/guides/saas-webhook-release-checklist.html

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

For GitHub Pages, the workflow sets `GITHUB_PAGES=true` so Vite uses the `/billing-webhook-kit/` base path.

## Privacy

Webhook signing secrets are used only in the browser through Web Crypto. The app has no backend and does not upload user input.
