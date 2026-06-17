# Security Policy

BillingWebhookKit is a browser-only testing tool. The hosted app has no backend and does not upload webhook signing secrets, pasted payloads, or generated fixtures.

## Reporting Issues

Use GitHub issues for security-relevant bugs that do not contain private secrets or customer data:

https://github.com/qihaze123/billing-webhook-kit/issues

Do not post:

- Real webhook signing secrets
- Production API keys
- Customer emails or order identifiers
- Private checkout URLs
- Raw production webhook payloads

If a report needs sensitive context, first open a minimal issue describing the class of problem without secrets.

## Supported Surface

- Static GitHub Pages app
- Browser-only Web Crypto signature utilities
- Public free sample package
- Public documentation and guide pages

The paid Pro Kit is a local digital asset pack. Do not include private Pro Kit archive contents in public issues unless the same file is already present in the public free sample or manifest.
