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
    <main>
      <section className="room-wrap">
        <div className="room-head">
          <h1>Admin Health</h1>
          <button className="secondary" onClick={logout} disabled={isLoggingOut}>
            {isLoggingOut ? "Выход..." : "Выйти"}
          </button>
        </div>

        <p>Комната: {roomName}</p>
        <div className="participants">
          <article className="tile">Активных участников: {participantCount}</article>
        </div>

        <div className="checks">
          {checks.map((check) => (
            <div className="check-item" key={check.label}>
              <span>{check.label}</span>
              <strong className={check.ok ? "ok" : "bad"}>
                {check.ok ? "OK" : "Missing"}
              </strong>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
