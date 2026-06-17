# Billing Webhook Review

Generated from the BillingWebhookKit free sample.

## Route Under Review

- Provider: Lemon Squeezy
- Event: order_created
- Framework: Next.js App Router
- Endpoint: /api/webhooks/lemonsqueezy
- Inspector source: sample fixture

## Signature Gate

- Fixture signature: generated locally from `test_webhook_secret`
- Verifier status: expected to match the exact raw body
- Raw body handling: `await request.text()` before JSON parsing

## Trusted Fields After Verification

- Event name: order_created
- Object: orders:ord_sample_1001
- Target record: buyer:buyer@example.com
- Customer: 67890
- Buyer email: buyer@example.com
- Status: paid
- Amount: CNY 69.00
- Recommended idempotency key: lemonsqueezy:order_created:orders:ord_sample_1001

## Handler Decision

Grant one-time purchase access after storing the idempotency key and confirming the order status is paid.

## Safety Checks

- Verify HMAC before parsing business fields.
- Persist the idempotency key before granting access or sending emails.
- Return success for duplicate events after confirming the side effect already ran.
- Keep production webhook secrets out of fixtures, logs, screenshots, and support tickets.
