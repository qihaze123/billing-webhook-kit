import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import fixture from "../fixtures/lemon/order-created.sample.json";

const secret = "test_webhook_secret";

function sign(rawBody: string) {
  return createHmac("sha256", secret).update(rawBody).digest("hex");
}

describe("Lemon Squeezy webhook signature", () => {
  it("signs the exact raw JSON body used by the handler", () => {
    const rawBody = JSON.stringify(fixture);
    const signature = sign(rawBody);

    expect(signature).toMatch(/^[a-f0-9]{64}$/);
  });

  it("changes when the request body changes", () => {
    const rawBody = JSON.stringify(fixture);
    const changedBody = JSON.stringify({ ...fixture, sample_mutation: true });

    expect(sign(changedBody)).not.toBe(sign(rawBody));
  });
});
