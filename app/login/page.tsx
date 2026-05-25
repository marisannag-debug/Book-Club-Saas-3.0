"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import LoginForm from "../components/auth/LoginForm";

function normalizeRedirect(value: string | null) {
  if (!value || !value.startsWith("/")) {
    return undefined;
  }

  return value;
}

function LoginPageContent() {
  const searchParams = useSearchParams();
  const returnTo = normalizeRedirect(searchParams.get("returnTo"));

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h2 className="mb-4 text-2xl font-bold">Zaloguj się</h2>
      <LoginForm redirectTo={returnTo} />
    </main>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-3xl px-6 py-16">
          <h2 className="mb-4 text-2xl font-bold">Zaloguj się</h2>
        </main>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
