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
    useTracks,
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
    const [deviceError, setDeviceError] = useState("");
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
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name: normalizedName }),
            });
            const payload = (await response
                .json()
                .catch(() => null)) as Partial<
                TokenResponse & { error: string }
            > | null;

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
                roomName: payload.roomName,
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
            <main className="grid min-h-screen place-items-center p-4">
                <section className="w-full max-w-[420px] rounded-2xl border border-slate-700 bg-slate-900/90 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-sm">
                    <h1 className="text-3xl font-semibold">Комната</h1>
                    <p className="mt-2 text-sm text-slate-400">
                        Введи имя, чтобы подключиться к звонку.
                    </p>

                    <div className="mt-4 space-y-3">
                        <label
                            htmlFor="displayName"
                            className="block text-sm text-slate-300"
                        >
                            Твое имя
                        </label>
                        <input
                            id="displayName"
                            value={displayName}
                            onChange={(event) =>
                                setDisplayName(event.target.value)
                            }
                            placeholder="Например, DMS dos"
                            maxLength={30}
                            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-3 text-base text-slate-100 outline-none ring-cyan-400/70 transition focus:ring-2"
                        />

                        <button
                            type="button"
                            onClick={joinCall}
                            disabled={isJoining}
                            className="w-full rounded-xl bg-cyan-400 px-4 py-3 font-bold text-cyan-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {isJoining ? "Подключаем..." : "Подключиться"}
                        </button>
                        <button
                            type="button"
                            onClick={leaveRoom}
                            disabled={isLeaving}
                            className="w-full rounded-xl bg-slate-700 px-4 py-3 font-semibold text-slate-100 transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {isLeaving ? "Выход..." : "Выйти из комнаты"}
                        </button>
                        {error ? (
                            <div className="text-sm text-rose-400">{error}</div>
                        ) : null}
                    </div>
                </section>
            </main>
        );
    }

    return (
        <main className="grid min-h-screen place-items-center p-4">
            <LiveKitRoom
                token={connection.token}
                serverUrl={connection.wsUrl}
                connect
                video
                audio
                className="w-full max-w-[1080px] rounded-2xl border border-slate-700 bg-slate-900/90 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-sm [&_.lk-control-bar]:mt-3 [&_.lk-control-bar]:max-h-none [&_.lk-control-bar]:flex-wrap [&_.lk-control-bar]:justify-center [&_.lk-control-bar]:gap-2 [&_.lk-control-bar]:border-slate-700 [&_.lk-control-bar_.lk-button]:px-3 [&_.lk-control-bar_.lk-button]:py-2 [&_.lk-control-bar_.lk-button]:text-sm [&_.lk-control-bar_.lk-button-group]:h-auto [&_.lk-device-menu]:z-20 [&_.lk-device-menu]:border [&_.lk-device-menu]:border-slate-700 [&_.lk-device-menu]:bg-slate-950/95 [&_.lk-device-menu]:backdrop-blur [&_.lk-device-menu-heading]:px-2 [&_.lk-device-menu-heading]:py-1 [&_.lk-device-menu-heading]:text-xs [&_.lk-device-menu-heading]:opacity-80 [&_.lk-grid-layout]:max-h-[70vh] [&_.lk-grid-layout]:min-h-[46vh] md:[&_.lk-grid-layout]:min-h-[52vh] [&_.lk-media-device-select:not(:last-child)]:mb-2 [&_.lk-media-device-select:not(:last-child)]:pb-1 [&_.lk-media-device-select_li:not(:last-child)]:mb-0.5 [&_.lk-media-device-select_li>.lk-button]:bg-slate-900/75 [&_.lk-media-device-select_li>.lk-button]:px-2 [&_.lk-media-device-select_li>.lk-button]:py-1.5 [&_.lk-media-device-select_li>.lk-button]:text-[13px] [&_.lk-participant-tile]:overflow-hidden [&_.lk-participant-tile]:rounded-xl [&_.lk-participant-tile]:border [&_.lk-participant-tile]:border-slate-700"
                onDisconnected={() => {
                    setConnection(null);
                }}
            >
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-2xl font-semibold">
                        Комната: {connection.roomName}
                    </h1>
                    <button
                        onClick={leaveRoom}
                        disabled={isLeaving}
                        className="rounded-xl bg-slate-700 px-4 py-3 font-semibold text-slate-100 transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {isLeaving ? "Выход..." : "Выйти из комнаты"}
                    </button>
                </div>
                <RoomGrid />
                {deviceError ? (
                    <div className="mt-2 text-sm text-rose-400">
                        Ошибка устройства: {deviceError}
                    </div>
                ) : null}
                <ConnectionStateToast />
                <RoomAudioRenderer />
                <ControlBar
                    controls={{
                        chat: false,
                        screenShare: false,
                        leave: false,
                    }}
                    onDeviceError={({ source, error }) => {
                        setDeviceError(`${source}: ${error.message}`);
                    }}
                />
            </LiveKitRoom>
        </main>
    );
}

function RoomGrid() {
    const tracks = useTracks(
        [{ source: Track.Source.Camera, withPlaceholder: true }],
        { onlySubscribed: false },
    );
    const localTrack = tracks.find(
        (track) => track?.participant?.isLocal === true,
    );
    const remoteTracks = tracks.filter(
        (track) => track?.participant?.isLocal === false,
    );
    const mainMobileTrack = remoteTracks[0] ?? localTrack ?? tracks[0];

    return (
        <div className="mt-4">
            <div className="hidden md:block">
                <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
                    <GridLayout tracks={tracks}>
                        <ParticipantTile />
                    </GridLayout>
                </div>
            </div>

            <div className="relative md:hidden">
                {mainMobileTrack ? (
                    <ParticipantTile
                        trackRef={mainMobileTrack}
                        className="h-[62vh] min-h-[52vh] w-full rounded-xl border border-slate-700 bg-black"
                    />
                ) : (
                    <div className="grid h-[62vh] min-h-[52vh] place-items-center rounded-xl border border-slate-700 bg-slate-950 text-slate-400">
                        Нет видео
                    </div>
                )}

                {localTrack &&
                mainMobileTrack &&
                localTrack.participant.identity !==
                    mainMobileTrack.participant.identity ? (
                    <ParticipantTile
                        trackRef={localTrack}
                        className="absolute bottom-3 right-3 h-[24vh] min-h-[110px] w-[34vw] max-w-[150px] min-w-[100px] rounded-xl border border-slate-600 shadow-xl shadow-slate-950/70"
                    />
                ) : null}
            </div>
        </div>
    );
}
