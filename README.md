# BillingWebhookKit

[![Deploy GitHub Pages](https://github.com/qihaze123/billing-webhook-kit/actions/workflows/deploy.yml/badge.svg)](https://github.com/qihaze123/billing-webhook-kit/actions/workflows/deploy.yml)
[![Free sample release](https://img.shields.io/github/v/release/qihaze123/billing-webhook-kit?label=free%20sample)](https://github.com/qihaze123/billing-webhook-kit/releases/tag/v0.1.0)
![Browser-only](https://img.shields.io/badge/privacy-browser--only-0f766e)
![Production checkout](https://img.shields.io/badge/checkout-awaiting%20live%20key-f59e0b)

Browser-only payment webhook fixture generator, raw-body signature verifier, signature mismatch debugger, payload inspector, idempotency key builder, contract test generator, entitlement decision matrix, launch readiness scorecard, duplicate replay simulator, debugging cost calculator, and review report exporter for SaaS billing integrations.

Use it when you need to test a billing webhook route before a real Lemon Squeezy, Stripe, Paddle, or Polar event hits production.

## Fast Paths

- Live tool: https://qihaze123.github.io/billing-webhook-kit/
- Free sample: https://qihaze123.github.io/billing-webhook-kit/free-sample.html
- Free sample GitHub release: https://github.com/qihaze123/billing-webhook-kit/releases/tag/v0.1.0
- Guide index: https://qihaze123.github.io/billing-webhook-kit/guides/
- Pro Kit preview: https://qihaze123.github.io/billing-webhook-kit/pro-kit.html
- Public Pro Kit manifest: https://qihaze123.github.io/billing-webhook-kit/pro-kit-manifest.json

## Trust Signals

- Browser-only: webhook signing secrets stay local and are processed with Web Crypto.
- No backend: the hosted tool does not upload pasted payloads or secrets.
- Free sample release: public zip with fixture, handler, signature, contract, replay tests, review report, and CI skeleton.
- Pro Kit manifest: public file count, test count, checksum, and safety flags without exposing the paid archive.
- Production checkout: intentionally disabled until the live Lemon Squeezy key and variant are ready.
- Support policy: use fake fixtures and fake secrets in public issues; see [SUPPORT.md](SUPPORT.md).

## Checklist

Use the public Lemon Squeezy webhook test checklist for signature, contract, idempotency, and duplicate replay review:

https://gist.github.com/qihaze123/3a13c5533c0e4fe69a3b0759668e9789

![BillingWebhookKit browser-only webhook fixture generator](public/product-screenshot.png)

The free tool generates Lemon Squeezy webhook payloads, verifies HMAC signatures against exact raw request bodies, debugs signature mismatches, inspects trusted billing fields, builds idempotency keys, generates contract tests, recommends idempotency keys, maps events to entitlement decisions, scores launch readiness, simulates duplicate webhook replays, estimates webhook debugging cost, exports PR-ready Markdown review reports, creates cURL replay commands, and provides starter handlers for Next.js, Hono, and Express. It is designed for local billing integration tests, CI fixtures, and webhook replay debugging.

## What It Helps Test

- Lemon Squeezy `order_created` and subscription events
- HMAC SHA-256 webhook signature verification
- Received `x-signature` headers against exact raw request bodies
- Signature mismatch diagnosis for raw-body changes, wrong secrets, header formats, framework parsers, and cURL replay mistakes
- Payload inspection for event name, object ID, customer, status, amount, and target record
- Idempotency key generation from provider, uniqueness scope, event name, and object ID
- Contract test generation for stable event, object, status, customer, currency, and idempotency fields
- Recommended idempotency keys for safe webhook retries
- Entitlement decisions for access grants, license delivery, renewals, cancellations, failed payments, and unknown events
- Launch readiness scoring for signature tests, duplicate replay, entitlement policy, fixtures, secrets, smoke tests, review reports, and monitoring
- Duplicate replay behavior for process-once/skip-duplicate tests
- Webhook debugging cost estimates for launch planning
- PR-ready Markdown reports for webhook route review and release checklists
- cURL webhook replay into local, tunnel, staging, or CI routes
- Next.js, Hono, and Express raw-body handler patterns
- Billing webhook idempotency and retry behavior

## Pro Kit

The paid Pro Kit launch price is CN¥69 and adds copy-ready billing webhook assets:

- Lemon Squeezy fixture library
- Stripe, Paddle, and Polar starter fixtures
- Next.js, Hono, Express, and Cloudflare Workers route templates
- Vitest signature verification, contract, and duplicate replay tests
- GitHub Actions billing webhook CI checks
- Webhook review report templates and release checklist notes
- Idempotency runbook, integration checklist, and replay notes

Use the free sample to validate the format first. It includes one Lemon Squeezy fixture, one Next.js handler, signature/contract/duplicate-replay tests, a review report sample, and a CI skeleton. Upgrade when you need the full 29-file package, more Lemon Squeezy lifecycle fixtures, Stripe/Paddle/Polar starter events, four route handlers, and 12 verified local tests.

Preview page: https://qihaze123.github.io/billing-webhook-kit/pro-kit.html

Free sample pack: https://qihaze123.github.io/billing-webhook-kit/free-sample.html

Free sample GitHub release: https://github.com/qihaze123/billing-webhook-kit/releases/tag/v0.1.0

Public Pro Kit manifest: https://qihaze123.github.io/billing-webhook-kit/pro-kit-manifest.json

Current checkout state: public checkout is disabled until live Lemon Squeezy production configuration is connected. The Pro Kit archive stays private; the manifest exposes file count, test count, checksum, and safety flags for pre-purchase inspection.

## Guides

- https://qihaze123.github.io/billing-webhook-kit/guides/
- https://qihaze123.github.io/billing-webhook-kit/guides/lemon-squeezy-webhook-test.html
- https://qihaze123.github.io/billing-webhook-kit/guides/lemon-squeezy-webhook-signature.html
- https://qihaze123.github.io/billing-webhook-kit/guides/lemon-squeezy-webhook-test-checklist.html
- https://qihaze123.github.io/billing-webhook-kit/guides/lemon-squeezy-webhook-raw-body-nextjs.html
- https://qihaze123.github.io/billing-webhook-kit/guides/lemon-squeezy-x-signature-invalid.html
- https://qihaze123.github.io/billing-webhook-kit/guides/lemon-squeezy-order-created-fixture.html
- https://qihaze123.github.io/billing-webhook-kit/guides/webhook-signature-mismatch-debugger.html
- https://qihaze123.github.io/billing-webhook-kit/guides/lemon-squeezy-webhook-idempotency.html
- https://qihaze123.github.io/billing-webhook-kit/guides/webhook-idempotency-key-generator.html
- https://qihaze123.github.io/billing-webhook-kit/guides/payment-webhook-contract-test-generator.html
- https://qihaze123.github.io/billing-webhook-kit/guides/payment-webhook-ci-tests.html
- https://qihaze123.github.io/billing-webhook-kit/guides/billing-webhook-launch-readiness-checklist.html
- https://qihaze123.github.io/billing-webhook-kit/guides/billing-webhook-cost-calculator.html
- https://qihaze123.github.io/billing-webhook-kit/guides/webhook-entitlement-decision-matrix.html
- https://qihaze123.github.io/billing-webhook-kit/guides/webhook-idempotency-checklist.html
- https://qihaze123.github.io/billing-webhook-kit/guides/webhook-duplicate-replay-test.html
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

## License

The public repository code and documentation are MIT licensed. Private paid Pro Kit archive contents are not published in this repository.
