import { describe, expect, it } from "vitest";
import { rateLimitKey } from "./rate-limit";
import { ApiError, MAX_JSON_BYTES, assertSameOrigin, clientIp, readJsonBody } from "./request";

function post(headers: Record<string, string>, body = "{}") {
  return new Request("http://localhost:3000/api/bookings", { method: "POST", headers, body });
}

async function statusOf(promise: Promise<unknown> | (() => unknown)): Promise<number | "ok"> {
  try {
    await (typeof promise === "function" ? promise() : promise);
    return "ok";
  } catch (error) {
    if (error instanceof ApiError) return error.status;
    throw error;
  }
}

describe("assertSameOrigin", () => {
  it("allows same-origin requests", async () => {
    expect(await statusOf(() => assertSameOrigin(post({ origin: "http://localhost:3000" })))).toBe("ok");
  });

  it("blocks cross-site requests", async () => {
    expect(await statusOf(() => assertSameOrigin(post({ origin: "https://evil.example" })))).toBe(403);
    expect(await statusOf(() => assertSameOrigin(post({ "sec-fetch-site": "cross-site" })))).toBe(403);
  });
});

describe("readJsonBody", () => {
  it("parses JSON", async () => {
    await expect(readJsonBody(post({ "content-type": "application/json" }, '{"a":1}'))).resolves.toEqual({ a: 1 });
  });

  it("rejects form posts (CSRF-able content types)", async () => {
    expect(await statusOf(readJsonBody(post({ "content-type": "application/x-www-form-urlencoded" }, "a=1")))).toBe(415);
    expect(await statusOf(readJsonBody(post({ "content-type": "text/plain" }, "{}")))).toBe(415);
  });

  it("rejects oversized and malformed bodies", async () => {
    const big = JSON.stringify({ x: "a".repeat(MAX_JSON_BYTES) });
    expect(await statusOf(readJsonBody(post({ "content-type": "application/json" }, big)))).toBe(413);
    expect(await statusOf(readJsonBody(post({ "content-type": "application/json" }, "{nope")))).toBe(400);
  });
});

describe("client identification", () => {
  it("prefers x-real-ip, then the first x-forwarded-for entry", () => {
    expect(clientIp(new Headers({ "x-real-ip": "1.2.3.4", "x-forwarded-for": "9.9.9.9" }))).toBe("1.2.3.4");
    expect(clientIp(new Headers({ "x-forwarded-for": "5.6.7.8, 10.0.0.1" }))).toBe("5.6.7.8");
    expect(clientIp(new Headers())).toBe("unknown");
  });

  it("never puts the raw IP in the rate-limit key", () => {
    const key = rateLimitKey("booking", "203.0.113.7", "salt-salt-salt-salt");
    expect(key).toMatch(/^booking:[\w-]{32}$/);
    expect(key).not.toContain("203.0.113.7");
    expect(rateLimitKey("booking", "203.0.113.7", "another-salt-value")).not.toBe(key);
  });
});
