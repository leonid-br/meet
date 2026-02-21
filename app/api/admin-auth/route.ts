import { NextRequest, NextResponse } from "next/server";
import { createAdminToken, getAdminCookieName } from "@/lib/auth";

const COOKIE_NAME = getAdminCookieName();

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null);
  const password = payload?.password;
  const expectedPassword = process.env.ADMIN_PASSWORD;
  const authSecret = process.env.ADMIN_AUTH_SECRET || process.env.ROOM_AUTH_SECRET;

  if (!expectedPassword || !authSecret) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD and ADMIN_AUTH_SECRET must be configured" },
      { status: 500 }
    );
  }

  if (typeof password !== "string" || password !== expectedPassword) {
    return NextResponse.json({ error: "Invalid admin password" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, createAdminToken(authSecret), {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 8
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
