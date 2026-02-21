"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginClient() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        if (response.status === 401) {
          setError("Неверный админ-пароль");
        } else {
          setError(payload?.error || "Ошибка авторизации администратора");
        }
        return;
      }

      router.push("/admin/health");
      router.refresh();
    } catch {
      setError("Ошибка сети, попробуй снова");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main>
      <section className="card">
        <h1>Admin Login</h1>
        <p>Доступ только для владельца.</p>
        <form onSubmit={onSubmit}>
          <label htmlFor="adminPassword">Админ-пароль</label>
          <input
            id="adminPassword"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Введите админ-пароль"
            required
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Проверяем..." : "Войти в админку"}
          </button>
          {error ? <div className="error">{error}</div> : null}
        </form>
      </section>
    </main>
  );
}
