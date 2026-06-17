# BillingWebhookKit

Browser-only payment webhook fixture generator for SaaS billing integrations.

The free tool generates Lemon Squeezy webhook payloads, HMAC signatures, cURL replay commands, and starter handlers for Next.js, Hono, and Express.

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

