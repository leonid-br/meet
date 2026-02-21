import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "room_auth";
const AUTH_VALUE = "room_access";

export function getAuthCookieName() {
  return COOKIE_NAME;
}

export function createAuthToken(secret: string) {
  const signature = createSignature(AUTH_VALUE, secret);
  return `${AUTH_VALUE}.${signature}`;
}

export function verifyAuthToken(token: string | undefined, secret: string) {
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

  return timingSafeEqual(left, right) && value === AUTH_VALUE;
}

function createSignature(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}
