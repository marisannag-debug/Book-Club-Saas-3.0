"use client";

import { useState } from "react";
import { loginUser } from "../../../lib/auth";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginUser(email, password);
      setMessage(res?.message ?? "Zalogowano (mock)");
    } catch (err) {
      setMessage("Błąd logowania");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4">
      <label htmlFor="login-email" className="block mb-2">Email</label>
      <input
        id="login-email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full p-2 border rounded mb-4"
      />

      <label htmlFor="login-password" className="block mb-2">Hasło</label>
      <input
        id="login-password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="w-full p-2 border rounded mb-4"
      />

      <button disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
        {loading ? "Wysyłanie..." : "Zaloguj"}
      </button>

      {message && <p className="mt-4 text-sm">{message}</p>}
    </form>
  );
}
