"use client";

import Link from "next/link";
import { useState } from "react";
import { loginUser } from "../../../lib/auth";

type FormErrors = {
  email: string;
  password: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email: string) {
  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    return "Podaj adres e-mail.";
  }

  if (!emailPattern.test(trimmedEmail)) {
    return "Wpisz poprawny adres e-mail.";
  }

  return "";
}

function validatePassword(password: string) {
  if (!password.trim()) {
    return "Podaj hasło.";
  }

  return "";
}

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({ email: "", password: "" });
  const emailId = "login-email";
  const passwordId = "login-password";
  const emailErrorId = "login-email-error";
  const passwordErrorId = "login-password-error";

  const emailError = errors.email || (email.length > 0 ? validateEmail(email) : "");
  const passwordError = errors.password || (password.length > 0 ? validatePassword(password) : "");
  const canSubmit = !loading && !validateEmail(email) && !validatePassword(password);

  function handleEmailChange(value: string) {
    setEmail(value);
    setErrors((current) => ({
      ...current,
      email: validateEmail(value),
    }));
  }

  function handlePasswordChange(value: string) {
    setPassword(value);
    setErrors((current) => ({
      ...current,
      password: validatePassword(value),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const nextErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
    };

    setErrors(nextErrors);

    if (nextErrors.email || nextErrors.password) {
      setMessage("Uzupełnij poprawnie formularz logowania.");
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const res = await loginUser(email, password);
      setMessage(res.message);

      if (res.ok) {
        setPassword("");
      }
    } catch {
      setMessage("Nie udało się zalogować. Spróbuj ponownie.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <label htmlFor={emailId} className="mb-2 block text-sm font-medium text-slate-800">
        Email
      </label>
      <input
        id={emailId}
        type="email"
        value={email}
        onChange={(e) => handleEmailChange(e.target.value)}
        required
        autoComplete="email"
        aria-invalid={Boolean(emailError)}
        aria-describedby={emailError ? emailErrorId : undefined}
        disabled={loading}
        className="mb-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 disabled:cursor-not-allowed disabled:bg-slate-100"
      />
      {emailError ? (
        <p id={emailErrorId} className="mb-4 text-sm text-red-700" role="alert">
          {emailError}
        </p>
      ) : (
        <div className="mb-4" aria-hidden="true" />
      )}

      <label htmlFor={passwordId} className="mb-2 block text-sm font-medium text-slate-800">
        Hasło
      </label>
      <input
        id={passwordId}
        type="password"
        value={password}
        onChange={(e) => handlePasswordChange(e.target.value)}
        required
        autoComplete="current-password"
        aria-invalid={Boolean(passwordError)}
        aria-describedby={passwordError ? passwordErrorId : undefined}
        disabled={loading}
        className="mb-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 disabled:cursor-not-allowed disabled:bg-slate-100"
      />
      {passwordError ? (
        <p id={passwordErrorId} className="mb-4 text-sm text-red-700" role="alert">
          {passwordError}
        </p>
      ) : (
        <div className="mb-4" aria-hidden="true" />
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        aria-disabled={!canSubmit}
        className="inline-flex w-full items-center justify-center rounded-lg bg-slate-950 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {loading ? "Loguję..." : "Zaloguj się"}
      </button>

      {message && (
        <p className="mt-4 text-sm text-slate-700" role="status" aria-live="polite">
          {message}
        </p>
      )}

      <p className="mt-4 text-sm text-slate-600">
        Nie masz konta?{" "}
        <Link href="/register" className="font-semibold text-slate-900 underline-offset-4 hover:underline">
          Zarejestruj się
        </Link>
      </p>
    </form>
  );
}
