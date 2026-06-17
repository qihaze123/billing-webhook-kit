# BillingWebhookKit Free Sample

This sample shows the structure used by BillingWebhookKit Pro without including production credentials or live provider data.

## Included

- `fixtures/lemon/order-created.sample.json`
- `src/handlers/next-app-router.sample.ts`
- `tests/lemon-signature.sample.test.ts`
- `.github/workflows/webhook-checks.sample.yml`

## How to Use

1. Copy the fixture into your test folder.
2. Keep `test_webhook_secret` as a local-only test value.
3. Adapt the handler to your app's entitlement logic.
4. Run the signature test in CI before changing billing code.

The full Pro Kit adds more Lemon Squeezy lifecycle fixtures, Stripe/Paddle/Polar starter events, additional route handlers, idempotency tests, and a production launch checklist.
