import { describe, expect, it } from "vitest";
import fixture from "../fixtures/lemon/order-created.sample.json";

function idempotencyKey(payload: typeof fixture) {
  const eventName = payload.meta?.event_name;
  const objectType = payload.data?.type;
  const objectId = payload.data?.id;

  if (!eventName || !objectType || !objectId) {
    throw new Error("Missing event_name, data.type, or data.id");
  }

  return `lemon_squeezy:${eventName}:${objectType}:${objectId}`;
}

describe("Lemon Squeezy duplicate replay", () => {
  it("runs the order side effect once and skips duplicate deliveries", () => {
    const processed = new Set<string>();
    let sideEffects = 0;
    let duplicates = 0;

    for (const delivery of [fixture, fixture, fixture]) {
      const key = idempotencyKey(delivery);

      if (processed.has(key)) {
        duplicates += 1;
        continue;
      }

      processed.add(key);
      sideEffects += 1;
    }

    expect(sideEffects).toBe(1);
    expect(duplicates).toBe(2);
  });
});
