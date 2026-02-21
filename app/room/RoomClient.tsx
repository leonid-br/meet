"use client";

import "@livekit/components-styles";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ConnectionStateToast,
  ControlBar,
  GridLayout,
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
  useTracks
} from "@livekit/components-react";
import { Track } from "livekit-client";

type TokenResponse = {
  token: string;
  wsUrl: string;
  roomName: string;
};

export default function RoomClient() {
  const [isLeaving, setIsLeaving] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [connection, setConnection] = useState<TokenResponse | null>(null);
  const router = useRouter();

  const joinCall = async () => {
    const normalizedName = displayName.trim();
    if (normalizedName.length < 2) {
      setError("Имя должно быть минимум 2 символа");
      return;
    }

    setError("");
    setIsJoining(true);

    try {
      const response = await fetch("/api/livekit-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: normalizedName })
      });
      const payload = (await response.json().catch(() => null)) as
        | Partial<TokenResponse & { error: string }>
        | null;

      if (!response.ok) {
        setError(payload?.error || "Не удалось подключиться к звонку");
        return;
      }

      if (!payload?.token || !payload?.wsUrl || !payload?.roomName) {
        setError("Сервер вернул некорректный ответ");
        return;
      }

      setConnection({
        token: payload.token,
        wsUrl: payload.wsUrl,
        roomName: payload.roomName
      });
    } catch {
      setError("Ошибка сети, попробуй снова");
    } finally {
      setIsJoining(false);
    }
  };

  const leaveRoom = async () => {
    setIsLeaving(true);
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/");
    router.refresh();
  };

  if (!connection) {
    return (
      <main>
        <section className="card">
          <h1>Комната</h1>
          <p>Введи имя, чтобы подключиться к звонку.</p>
          <label htmlFor="displayName">Твое имя</label>
          <input
            id="displayName"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="Например, Leonid"
            maxLength={30}
          />
          <button type="button" onClick={joinCall} disabled={isJoining}>
            {isJoining ? "Подключаем..." : "Подключиться"}
          </button>
          <button
            type="button"
            className="secondary"
            onClick={leaveRoom}
            disabled={isLeaving}
          >
            {isLeaving ? "Выход..." : "Выйти из комнаты"}
          </button>
          {error ? <div className="error">{error}</div> : null}
        </section>
      </main>
    );
  }

  return (
    <main>
      <LiveKitRoom
        token={connection.token}
        serverUrl={connection.wsUrl}
        connect
        video
        audio
        className="room-wrap room-live"
        onDisconnected={() => {
          setConnection(null);
        }}
      >
        <div className="room-head">
          <h1>Комната: {connection.roomName}</h1>
          <button className="secondary" onClick={leaveRoom} disabled={isLeaving}>
            {isLeaving ? "Выход..." : "Выйти из комнаты"}
          </button>
        </div>
        <RoomGrid />
        <ConnectionStateToast />
        <RoomAudioRenderer />
        <ControlBar controls={{ chat: false, screenShare: false, leave: false }} />
      </LiveKitRoom>
    </main>
  );
}

function RoomGrid() {
  const tracks = useTracks(
    [{ source: Track.Source.Camera, withPlaceholder: true }],
    { onlySubscribed: false }
  );

  return (
    <div className="participants participants-live">
      <GridLayout tracks={tracks}>
        <ParticipantTile />
      </GridLayout>
    </div>
  );
}
