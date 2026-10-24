import assert from "node:assert/strict";
import test from "node:test";
import {
  createSessionToken,
  verifySessionToken,
} from "../src/lib/session-token.ts";

const secret = "a-test-only-secret-with-at-least-32-characters";
const user = {
  name: "Marina Silva",
  email: "marina@example.com",
  role: "Administrador",
};

test("a signed session returns the authenticated user before expiration", () => {
  const token = createSessionToken(user, secret, 2000);
  assert.deepEqual(verifySessionToken(token, secret, 1000), user);
});

test("rejects an expired, malformed or incorrectly signed session", () => {
  const token = createSessionToken(user, secret, 2000);

  assert.equal(verifySessionToken(token, secret, 2000), null);
  assert.equal(verifySessionToken(token, "another-secret", 1000), null);
  assert.equal(verifySessionToken(`${token}tampered`, secret, 1000), null);
  assert.equal(verifySessionToken("invalid", secret, 1000), null);
  assert.equal(verifySessionToken("", secret, 1000), null);
});

test("rejects a payload modified to impersonate another user", () => {
  const token = createSessionToken(user, secret, 2000);
  const [, signature] = token.split(".");
  const payload = Buffer.from(
    JSON.stringify({
      user: { ...user, name: "Another user" },
      expiresAt: 2000,
    }),
  ).toString("base64url");

  assert.equal(
    verifySessionToken(`${payload}.${signature}`, secret, 1000),
    null,
  );
});
