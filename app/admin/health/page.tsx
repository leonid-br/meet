import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { RoomServiceClient } from "livekit-server-sdk";
import { getAdminCookieName, verifyAdminToken } from "@/lib/auth";
import { resolveRoomName, toLivekitHttpUrl } from "@/lib/livekit";
import AdminHealthClient from "./AdminHealthClient";

export const dynamic = "force-dynamic";

export default async function AdminHealthPage() {
  const adminSecret = process.env.ADMIN_AUTH_SECRET || process.env.ROOM_AUTH_SECRET;
  if (!adminSecret) {
    redirect("/admin");
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(getAdminCookieName())?.value;
  if (!verifyAdminToken(token, adminSecret)) {
    redirect("/admin");
  }

  const roomName = resolveRoomName();
  const participantCount = await getParticipantCount(roomName);
  const trafficEstimate = estimateTraffic(participantCount);

  const checks = [
    { label: "ROOM_PASSWORD", ok: Boolean(process.env.ROOM_PASSWORD) },
    { label: "ROOM_AUTH_SECRET", ok: Boolean(process.env.ROOM_AUTH_SECRET) },
    { label: "LIVEKIT_URL", ok: Boolean(process.env.LIVEKIT_URL) },
    { label: "LIVEKIT_API_KEY", ok: Boolean(process.env.LIVEKIT_API_KEY) },
    { label: "LIVEKIT_API_SECRET", ok: Boolean(process.env.LIVEKIT_API_SECRET) },
    { label: "ADMIN_PASSWORD", ok: Boolean(process.env.ADMIN_PASSWORD) }
  ];

  return (
    <AdminHealthClient
      roomName={roomName}
      participantCount={participantCount}
      trafficEstimate={trafficEstimate}
      checks={checks}
    />
  );
}

function estimateTraffic(participantCount: number) {
  const videoValue = Number(process.env.TRAFFIC_ESTIMATE_VIDEO_MBPS || "1.2");
  const audioValue = Number(process.env.TRAFFIC_ESTIMATE_AUDIO_MBPS || "0.06");
  const averageVideoMbps = Number.isFinite(videoValue) && videoValue > 0 ? videoValue : 1.2;
  const averageAudioMbps = Number.isFinite(audioValue) && audioValue > 0 ? audioValue : 0.06;
  const perStreamMbps = averageVideoMbps + averageAudioMbps;

  if (participantCount < 2 || perStreamMbps <= 0) {
    return {
      downstreamMbps: 0,
      downstreamGbPerHour: 0,
      assumptions: {
        videoMbps: averageVideoMbps,
        audioMbps: averageAudioMbps
      }
    };
  }

  const streamFanout = participantCount * (participantCount - 1);
  const downstreamMbps = streamFanout * perStreamMbps;
  const downstreamGbPerHour = (downstreamMbps / 8) * 3600 / 1024;

  return {
    downstreamMbps,
    downstreamGbPerHour,
    assumptions: {
      videoMbps: averageVideoMbps,
      audioMbps: averageAudioMbps
    }
  };
}

async function getParticipantCount(roomName: string) {
  const livekitUrl = process.env.LIVEKIT_URL;
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!livekitUrl || !apiKey || !apiSecret) {
    return 0;
  }

  try {
    const roomService = new RoomServiceClient(
      toLivekitHttpUrl(livekitUrl),
      apiKey,
      apiSecret
    );
    const participants = await roomService.listParticipants(roomName);
    return participants.length;
  } catch {
    return 0;
  }
}
