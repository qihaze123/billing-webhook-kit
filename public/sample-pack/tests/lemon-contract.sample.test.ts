import { describe, expect, it } from "vitest";
import fixture from "../fixtures/lemon/order-created.sample.json";

function idempotencyKey(payload: typeof fixture) {
  return [
    "lemonsqueezy",
    payload.meta.event_name,
    payload.data.type,
    payload.data.id
  ].join(":");
}

describe("Lemon Squeezy order_created contract", () => {
  it("keeps trusted billing fields stable before side effects", () => {
    expect(fixture.meta.event_name).toBe("order_created");
    expect(fixture.data.type).toBe("orders");
    expect(fixture.data.id).toBe("ord_sample_1001");
    expect(fixture.data.attributes.status).toBe("paid");
    expect(String(fixture.data.attributes.customer_id)).toBe("67890");
    expect(fixture.data.attributes.currency).toBe("CNY");
    expect(fixture.data.attributes.total).toBe(6900);
  });

  it("derives the expected process-once idempotency key", () => {
    expect(idempotencyKey(fixture)).toBe("lemonsqueezy:order_created:orders:ord_sample_1001");
  });
});
