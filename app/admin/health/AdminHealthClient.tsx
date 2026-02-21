"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type HealthProps = {
  roomName: string;
  participantCount: number;
  checks: Array<{ label: string; ok: boolean }>;
};

export default function AdminHealthClient({
  roomName,
  participantCount,
  checks
}: HealthProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = async () => {
    setIsLoggingOut(true);
    await fetch("/api/admin-auth", { method: "DELETE" });
    router.push("/admin");
    router.refresh();
  };

  return (
    <main className="grid min-h-screen place-items-center p-4">
      <section className="w-full max-w-[920px] rounded-2xl border border-slate-700 bg-slate-900/90 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-sm">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-semibold">Admin Health</h1>
          <button
            onClick={logout}
            disabled={isLoggingOut}
            className="rounded-xl bg-slate-700 px-4 py-3 font-semibold text-slate-100 transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoggingOut ? "Выход..." : "Выйти"}
          </button>
        </div>

        <p className="text-sm text-slate-400">Комната: {roomName}</p>

        <div className="mt-4 grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
          <article className="grid min-h-[140px] place-items-center rounded-xl border border-dashed border-slate-600 bg-slate-950 text-slate-400">
            Активных участников: {participantCount}
          </article>
        </div>

        <div className="mt-4 grid gap-2">
          {checks.map((check) => (
            <div
              className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
              key={check.label}
            >
              <span>{check.label}</span>
              <strong className={check.ok ? "text-emerald-400" : "text-rose-400"}>
                {check.ok ? "OK" : "Missing"}
              </strong>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
