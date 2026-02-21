"use client";

import { CSSProperties, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginClient() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const passwordMaskStyle = {
    WebkitTextSecurity: isPasswordVisible ? "none" : "disc"
  } as CSSProperties;

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
    <main className="grid min-h-screen place-items-center p-4">
      <section className="w-full max-w-[420px] rounded-2xl border border-slate-700 bg-slate-900/90 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-sm">
        <h1 className="text-3xl font-semibold">Admin Login</h1>
        <p className="mt-2 text-sm text-slate-400">Доступ только для владельца.</p>

        <form onSubmit={onSubmit} autoComplete="off" className="mt-4 space-y-3">
          <label htmlFor="adminPassword" className="block text-sm text-slate-300">
            Админ-пароль
          </label>
          <div className="relative">
            <input
              id="adminPassword"
              name="admin_passcode"
              type="text"
              autoComplete="off"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Введите админ-пароль"
              required
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="none"
              data-lpignore="true"
              data-1p-ignore="true"
              style={passwordMaskStyle}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-3 pr-12 text-base text-slate-100 outline-none ring-cyan-400/70 transition focus:ring-2"
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg bg-slate-700 text-slate-100"
              onClick={() => setIsPasswordVisible((state) => !state)}
              aria-label={isPasswordVisible ? "Скрыть пароль" : "Показать пароль"}
            >
              {isPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
              <span className="sr-only">
                {isPasswordVisible ? "Скрыть пароль" : "Показать пароль"}
              </span>
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-cyan-400 px-4 py-3 font-bold text-cyan-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? "Проверяем..." : "Войти в админку"}
          </button>

          {error ? <div className="text-sm text-rose-400">{error}</div> : null}
        </form>
      </section>
    </main>
  );
}

function EyeIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M2 12C3 9 7 5 12 5C17 5 21 9 22 12C21 15 17 19 12 19C7 19 3 15 2 12Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M3 3L21 21M10.58 10.58A2 2 0 0013.42 13.42M9.88 5.09A10.95 10.95 0 0112 5C17 5 21 9 22 12C21.45 13.66 20.39 15.13 19 16.25M14.12 18.91A10.95 10.95 0 0112 19C7 19 3 15 2 12C2.55 10.34 3.61 8.87 5 7.75"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
