import type { EventId, FrameworkId } from "./fixtures";

export function asJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

export async function hmacSha256Hex(secret: string, body: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  return [...new Uint8Array(signature)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function curlCommand(endpoint: string, event: EventId, signature: string, payload: string): string {
  const normalizedEndpoint = endpoint.trim() || "https://example.com/api/webhooks/lemonsqueezy";
  return `curl -X POST '${normalizedEndpoint}' \\
  -H 'Content-Type: application/json' \\
  -H 'X-Event-Name: ${event}' \\
  -H 'X-Signature: ${signature || "GENERATED_SIGNATURE"}' \\
  --data '${payload.replaceAll("'", "'\\''")}'`;
}

export function handlerTemplate(framework: FrameworkId): string {
  if (framework === "hono") {
    return `import { Hono } from "hono";
import { timingSafeEqual, createHmac } from "node:crypto";

const app = new Hono();

function verifyLemonSignature(rawBody: string, signature: string, secret: string) {
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const expectedBytes = Buffer.from(expected, "hex");
  const receivedBytes = Buffer.from(signature, "hex");
  return expectedBytes.length === receivedBytes.length && timingSafeEqual(expectedBytes, receivedBytes);
}

app.post("/api/webhooks/lemonsqueezy", async (c) => {
  const rawBody = await c.req.text();
  const signature = c.req.header("x-signature") ?? "";

  if (!verifyLemonSignature(rawBody, signature, c.env.LEMONSQUEEZY_WEBHOOK_SECRET)) {
    return c.json({ error: "Invalid signature" }, 401);
  }

  const event = JSON.parse(rawBody);
  const eventName = event.meta?.event_name;

  if (eventName === "order_created") {
    // grant one-time purchase access
  }

  return c.json({ received: true });
});

export default app;`;
  }

  if (framework === "express") {
    return `import express from "express";
import { createHmac, timingSafeEqual } from "node:crypto";

const app = express();

app.post(
  "/api/webhooks/lemonsqueezy",
  express.raw({ type: "application/json" }),
  (req, res) => {
    const signature = String(req.header("x-signature") ?? "");
    const rawBody = req.body.toString("utf8");
    const expected = createHmac("sha256", process.env.LEMONSQUEEZY_WEBHOOK_SECRET!)
      .update(rawBody)
      .digest("hex");

    const valid =
      Buffer.byteLength(signature, "hex") === Buffer.byteLength(expected, "hex") &&
      timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expected, "hex"));

    if (!valid) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    const event = JSON.parse(rawBody);

    if (event.meta?.event_name === "subscription_payment_success") {
      // extend subscription entitlement
    }

    return res.json({ received: true });
  }
);

app.listen(3000);`;
  }

  return `import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function isValidLemonSignature(rawBody: string, signature: string, secret: string) {
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const expectedBytes = Buffer.from(expected, "hex");
  const receivedBytes = Buffer.from(signature, "hex");
  return expectedBytes.length === receivedBytes.length && timingSafeEqual(expectedBytes, receivedBytes);
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-signature") ?? "";

  if (!isValidLemonSignature(rawBody, signature, process.env.LEMONSQUEEZY_WEBHOOK_SECRET!)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);

  switch (event.meta?.event_name) {
    case "order_created":
      // grant one-time purchase access
      break;
    case "subscription_cancelled":
      // schedule entitlement removal
      break;
  }

  return NextResponse.json({ received: true });
}`;
}

export function testTemplate(event: EventId): string {
  return `import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { POST } from "../app/api/webhooks/lemonsqueezy/route";
import fixture from "./fixtures/lemon-${event}.json";

const secret = "test_webhook_secret";

function sign(body: string) {
  return createHmac("sha256", secret).update(body).digest("hex");
}

describe("Lemon Squeezy ${event}", () => {
  it("accepts a signed webhook payload", async () => {
    process.env.LEMONSQUEEZY_WEBHOOK_SECRET = secret;
    const body = JSON.stringify(fixture);
    const request = new Request("http://localhost/api/webhooks/lemonsqueezy", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-signature": sign(body)
      },
      body
    });

    const response = await POST(request as never);
    expect(response.status).toBe(200);
  });
});`;
}

export function downloadText(filename: string, content: string, type = "text/plain") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

