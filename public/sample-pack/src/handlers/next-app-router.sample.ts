import { createHmac, timingSafeEqual } from "node:crypto";

type LemonPayload = {
  meta?: {
    event_name?: string;
  };
  data?: {
    id?: string;
    attributes?: {
      status?: string;
      user_email?: string;
      first_order_item?: {
        variant_id?: number;
      };
    };
  };
};

function verifySignature(rawBody: string, signature: string, secret: string) {
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const received = Buffer.from(signature, "hex");
  const trusted = Buffer.from(expected, "hex");

  return received.length === trusted.length && timingSafeEqual(received, trusted);
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-signature") ?? "";
  const secret = process.env.LEMON_WEBHOOK_SECRET ?? "";

  if (!secret || !verifySignature(rawBody, signature, secret)) {
    return new Response("Invalid signature", { status: 401 });
  }

  const payload = JSON.parse(rawBody) as LemonPayload;
  const eventName = payload.meta?.event_name;

  if (eventName === "order_created" && payload.data?.attributes?.status === "paid") {
    // Replace this with your idempotent entitlement grant.
    console.log("Grant access for", payload.data.attributes.user_email);
  }

  return Response.json({ ok: true });
}
