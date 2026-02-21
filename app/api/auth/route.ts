import { NextRequest, NextResponse } from "next/server";
import { createAuthToken, getAuthCookieName } from "@/lib/auth";

const COOKIE_NAME = getAuthCookieName();

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const password = body?.password;
  const expectedPassword = process.env.ROOM_PASSWORD;
  const authSecret = process.env.ROOM_AUTH_SECRET;

  if (!expectedPassword || !authSecret) {
    return NextResponse.json(
      { error: "ROOM_PASSWORD and ROOM_AUTH_SECRET must be configured" },
      { status: 500 }
    );
  }

  if (typeof password !== "string" || password !== expectedPassword) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const token = createAuthToken(authSecret);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 0
  });

  return response;
}
