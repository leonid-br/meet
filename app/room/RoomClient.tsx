"use client";

import "@livekit/components-styles";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import {
    ConnectionStateToast,
    ControlBar,
    GridLayout,
    LiveKitRoom,
    ParticipantTile,
    RoomAudioRenderer,
    useRoomContext,
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
    const [cameraPermissionDenied, setCameraPermissionDenied] = useState(false);
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
        <main className="h-[100dvh] overflow-hidden p-2 sm:p-4">
            <LiveKitRoom
                token={connection.token}
                serverUrl={connection.wsUrl}
                connect
                video
                audio
                className="mx-auto flex h-full w-full max-w-[1240px] min-h-0 flex-col rounded-2xl border border-slate-700 bg-slate-900/90 p-3 shadow-2xl shadow-slate-950/40 backdrop-blur-sm sm:p-6 [&_.lk-control-bar]:max-h-none [&_.lk-control-bar]:flex-wrap [&_.lk-control-bar]:justify-center [&_.lk-control-bar]:gap-1.5 [&_.lk-control-bar]:border-slate-700 [&_.lk-control-bar]:px-1 [&_.lk-control-bar]:py-2 [&_.lk-control-bar_.lk-button]:my-0 [&_.lk-control-bar_.lk-button]:px-2.5 [&_.lk-control-bar_.lk-button]:py-1.5 [&_.lk-control-bar_.lk-button]:text-sm [&_.lk-control-bar_.lk-button-group]:h-auto [&_.lk-device-menu]:z-20 [&_.lk-device-menu]:border [&_.lk-device-menu]:border-slate-700 [&_.lk-device-menu]:bg-slate-950/95 [&_.lk-device-menu]:backdrop-blur [&_.lk-device-menu-heading]:px-2 [&_.lk-device-menu-heading]:py-1 [&_.lk-device-menu-heading]:text-xs [&_.lk-device-menu-heading]:opacity-80 [&_.lk-grid-layout]:max-h-[70vh] [&_.lk-grid-layout]:min-h-[46vh] md:[&_.lk-grid-layout]:min-h-[52vh] [&_.lk-media-device-select:not(:last-child)]:mb-2 [&_.lk-media-device-select:not(:last-child)]:pb-1 [&_.lk-media-device-select_li:not(:last-child)]:mb-0.5 [&_.lk-media-device-select_li>.lk-button]:bg-slate-900/75 [&_.lk-media-device-select_li>.lk-button]:px-2 [&_.lk-media-device-select_li>.lk-button]:py-1.5 [&_.lk-media-device-select_li>.lk-button]:text-[13px] [&_.lk-participant-tile]:overflow-hidden [&_.lk-participant-tile]:rounded-xl [&_.lk-participant-tile]:border [&_.lk-participant-tile]:border-slate-700"
                onDisconnected={() => {
                    setConnection(null);
                }}
            >
                <div className="mb-2 flex items-center justify-between gap-2">
                    <h1 className="truncate text-lg font-semibold sm:text-2xl">
                        {connection.roomName}
                    </h1>
                    <button
                        onClick={leaveRoom}
                        disabled={isLeaving}
                        aria-label="Выйти из комнаты"
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-700 text-slate-100 transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        <svg
                            className="h-5 w-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                        >
                            <path
                                d="M9 3H5a2 2 0 00-2 2v14a2 2 0 002 2h4M16 17l5-5-5-5M21 12H9"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>
                </div>
                <div className="min-h-0 flex-1">
                    <RoomGrid />
                </div>
                {deviceError ? (
                    <div className="mt-2 text-sm text-rose-400">
                        Ошибка устройства: {deviceError}
                    </div>
                ) : null}
                {cameraPermissionDenied ? (
                    <CameraPermissionRecovery
                        onSuccess={() => {
                            setCameraPermissionDenied(false);
                            setDeviceError("");
                        }}
                        onBlocked={(message) => {
                            setDeviceError(message);
                        }}
                    />
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
                        if (
                            source === Track.Source.Camera &&
                            /permission|denied|notallowed/i.test(error.message)
                        ) {
                            setCameraPermissionDenied(true);
                        }
                    }}
                />
            </LiveKitRoom>
        </main>
    );
}

function CameraPermissionRecovery({
    onSuccess,
    onBlocked,
}: {
    onSuccess: () => void;
    onBlocked: (message: string) => void;
}) {
    const room = useRoomContext();
    const [isRequesting, setIsRequesting] = useState(false);
    const [hint, setHint] = useState("");

    const retryCameraPermission = useCallback(async () => {
        setIsRequesting(true);
        setHint("");
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
            });
            stream.getTracks().forEach((track) => track.stop());
            await room.localParticipant.setCameraEnabled(true);
            onSuccess();
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Не удалось запросить камеру";
            if (/notallowed|permission|denied/i.test(message)) {
                setHint(
                    "Chrome заблокировал доступ. Открой: Адрес сайта -> Разрешения -> Камера -> Разрешить, затем обнови страницу.",
                );
            } else {
                setHint(message);
            }
            onBlocked(`camera: ${message}`);
        } finally {
            setIsRequesting(false);
        }
    }, [onBlocked, onSuccess, room.localParticipant]);

    return (
        <div className="mt-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-100">
            <div>
                Камера заблокирована. Нажми, чтобы заново запросить доступ.
            </div>
            <button
                type="button"
                onClick={retryCameraPermission}
                disabled={isRequesting}
                className="mt-2 rounded-lg bg-amber-300 px-3 py-2 font-semibold text-amber-950 transition hover:bg-amber-200 disabled:opacity-70"
            >
                {isRequesting ? "Запрашиваем..." : "Запросить доступ к камере"}
            </button>
            {hint ? (
                <div className="mt-2 text-xs text-amber-200/90">{hint}</div>
            ) : null}
        </div>
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
    const totalParticipants = tracks.length;

    return (
        <div className="h-full min-h-0">
            <div className="hidden md:block">
                <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
                    <GridLayout tracks={tracks}>
                        <ParticipantTile />
                    </GridLayout>
                </div>
            </div>

            <div className="h-full min-h-0 md:hidden">
                {totalParticipants === 4 ? (
                    <div className="grid h-full min-h-0 grid-cols-2 grid-rows-2 gap-2">
                        {tracks.slice(0, 4).map((track, index) => (
                            <ParticipantTile
                                key={`m4-${track.participant.identity}-${index}`}
                                trackRef={track}
                                className="h-full min-h-0 w-full rounded-xl border border-slate-700 bg-black"
                            />
                        ))}
                    </div>
                ) : totalParticipants === 5 &&
                  localTrack &&
                  remoteTracks.length >= 4 ? (
                    <div className="grid h-full min-h-0 grid-cols-[1fr_auto] gap-2">
                        <div className="grid min-h-0 grid-cols-2 grid-rows-2 gap-2">
                            {remoteTracks.slice(0, 4).map((track, index) => (
                                <ParticipantTile
                                    key={`m5-${track.participant.identity}-${index}`}
                                    trackRef={track}
                                    className="h-full min-h-0 w-full rounded-xl border border-slate-700 bg-black"
                                />
                            ))}
                        </div>
                        <div className="flex min-h-0 items-end pb-3 pr-1">
                            <ParticipantTile
                                trackRef={localTrack}
                                className="h-[10rem] w-[8rem] rounded-xl border border-slate-600 shadow-xl shadow-slate-950/70"
                            />
                        </div>
                    </div>
                ) : totalParticipants === 3 &&
                  localTrack &&
                  remoteTracks.length >= 2 ? (
                    <div className="grid h-full min-h-0 grid-cols-[1fr_auto] gap-2">
                        <div className="grid min-h-0 grid-rows-2 gap-2">
                            {remoteTracks.slice(0, 2).map((track, index) => (
                                <ParticipantTile
                                    key={`m3-${track.participant.identity}-${index}`}
                                    trackRef={track}
                                    className="h-full min-h-0 w-full rounded-xl border border-slate-700 bg-black"
                                />
                            ))}
                        </div>
                        <div className="flex min-h-0 items-end pb-3 pr-1">
                            <ParticipantTile
                                trackRef={localTrack}
                                className="h-[10rem] w-[8rem] rounded-xl border border-slate-600 shadow-xl shadow-slate-950/70"
                            />
                        </div>
                    </div>
                ) : mainMobileTrack ? (
                    <>
                        <ParticipantTile
                            trackRef={mainMobileTrack}
                            className="h-[75%] min-h-0 w-full rounded-xl border border-slate-700 bg-black"
                        />
                        {localTrack &&
                        mainMobileTrack &&
                        localTrack.participant.identity !==
                            mainMobileTrack.participant.identity ? (
                            <div className="flex h-[25%] items-end justify-end pr-3 pb-3">
                                <ParticipantTile
                                    trackRef={localTrack}
                                    className="h-[10rem] w-[8rem] rounded-xl border border-slate-600 shadow-xl shadow-slate-950/70"
                                />
                            </div>
                        ) : null}
                    </>
                ) : (
                    <div className="grid h-full min-h-0 place-items-center rounded-xl border border-slate-700 bg-slate-950 text-slate-400">
                        Нет видео
                    </div>
                )}
            </div>
        </div>
    );
}
