"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;

        if (response.status === 401) {
          setError("Неверный пароль");
        } else if (response.status >= 500) {
          setError(
            payload?.error ||
              "Ошибка конфигурации сервера: проверь env-переменные"
          );
        } else {
          setError("Не удалось войти");
        }
        return;
      }

      router.push("/room");
    } catch {
      setError("Ошибка сети, попробуй снова");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main>
      <section className="card">
        <h1>Leo Meet</h1>
        <p>Введи пароль и зайди в комнату звонка.</p>

        <form onSubmit={onSubmit}>
          <label htmlFor="password">Пароль комнаты</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Введите пароль"
            required
          />

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Проверяем..." : "Войти в комнату"}
          </button>

          {error ? <div className="error">{error}</div> : null}
        </form>
      </section>
    </main>
  );
}
