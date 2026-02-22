"use client";

type RoomErrorProps = {
    error: Error & { digest?: string };
    reset: () => void;
};

export default function RoomError({ error, reset }: RoomErrorProps) {
    return (
        <main className="grid min-h-screen place-items-center p-4">
            <section className="w-full max-w-[640px] rounded-2xl border border-rose-700/50 bg-slate-900/90 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-sm">
                <h1 className="text-2xl font-semibold text-rose-300">
                    Ошибка комнаты
                </h1>
                <p className="mt-2 text-sm text-slate-300">
                    Произошла client-side ошибка. Ниже текст исключения.
                </p>

                <pre className="mt-4 overflow-auto rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-rose-200">
                    {error?.message || "Unknown error"}
                </pre>

                {error?.digest ? (
                    <p className="mt-2 text-xs text-slate-500">
                        digest: {error.digest}
                    </p>
                ) : null}

                <button
                    type="button"
                    onClick={reset}
                    className="mt-4 rounded-xl bg-cyan-400 px-4 py-3 font-bold text-cyan-950 transition hover:bg-cyan-300"
                >
                    Попробовать снова
                </button>
            </section>
        </main>
    );
}
