import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";
import { getAuthCookieName, verifyAuthToken } from "@/lib/auth";

const DEFAULT_ROOM_NAME = "friends-room";

export async function POST(request: NextRequest) {
  const authSecret = process.env.ROOM_AUTH_SECRET;
  if (!authSecret) {
    return NextResponse.json(
      { error: "ROOM_AUTH_SECRET must be configured" },
      { status: 500 }
    );
  }

  const authCookie = request.cookies.get(getAuthCookieName())?.value;
  const hasRoomAccess = verifyAuthToken(authCookie, authSecret);
  if (!hasRoomAccess) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  const participantName = sanitizeDisplayName(payload?.name);
  if (!participantName) {
    return NextResponse.json(
      { error: "Name must be between 2 and 30 characters" },
      { status: 400 }
    );
  }

  const livekitUrl = process.env.LIVEKIT_URL;
  const livekitApiKey = process.env.LIVEKIT_API_KEY;
  const livekitApiSecret = process.env.LIVEKIT_API_SECRET;
  const roomName = process.env.LIVEKIT_ROOM_NAME || DEFAULT_ROOM_NAME;

  if (!livekitUrl || !livekitApiKey || !livekitApiSecret) {
    return NextResponse.json(
      {
        error:
          "LIVEKIT_URL, LIVEKIT_API_KEY and LIVEKIT_API_SECRET must be configured"
      },
      { status: 500 }
    );
  }

  const token = new AccessToken(livekitApiKey, livekitApiSecret, {
    identity: `${toSlug(participantName)}-${randomUUID().slice(0, 8)}`,
    name: participantName,
    ttl: "2h"
  });

  token.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true
  });

  const jwt = await token.toJwt();

  return NextResponse.json({
    token: jwt,
    roomName,
    wsUrl: livekitUrl.replace(/\/$/, "")
  });
}

function sanitizeDisplayName(input: unknown) {
  if (typeof input !== "string") {
    return null;
  }

  const value = input.trim().replace(/\s+/g, " ");
  if (value.length < 2 || value.length > 30) {
    return null;
  }

  return value;
}

function toSlug(input: string) {
  const latin = input
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();

  return latin || "guest";
}
