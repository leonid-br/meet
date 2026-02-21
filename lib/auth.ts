import { createHmac, timingSafeEqual } from "crypto";

const ROOM_COOKIE_NAME = "room_auth";
const ROOM_AUTH_VALUE = "room_access";
const ADMIN_COOKIE_NAME = "admin_auth";
const ADMIN_AUTH_VALUE = "admin_access";

export function getAuthCookieName() {
  return ROOM_COOKIE_NAME;
}

export function getAdminCookieName() {
  return ADMIN_COOKIE_NAME;
}

export function createAuthToken(secret: string) {
  return createScopedToken(ROOM_AUTH_VALUE, secret);
}

export function createAdminToken(secret: string) {
  return createScopedToken(ADMIN_AUTH_VALUE, secret);
}

export function verifyAuthToken(token: string | undefined, secret: string) {
  return verifyScopedToken(token, ROOM_AUTH_VALUE, secret);
}

export function verifyAdminToken(token: string | undefined, secret: string) {
  return verifyScopedToken(token, ADMIN_AUTH_VALUE, secret);
}

function createScopedToken(scope: string, secret: string) {
  const signature = createSignature(scope, secret);
  return `${scope}.${signature}`;
}

function verifyScopedToken(
  token: string | undefined,
  expectedScope: string,
  secret: string
) {
  if (!token) {
    return false;
  }

  const [value, signature] = token.split(".");
  if (!value || !signature) {
    return false;
  }

  const expectedSignature = createSignature(value, secret);
  const left = Buffer.from(signature);
  const right = Buffer.from(expectedSignature);

  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(left, right) && value === expectedScope;
}

function createSignature(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}
