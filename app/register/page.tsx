"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import RegisterForm from "../components/auth/RegisterForm";

function normalizeRedirect(value: string | null) {
  if (!value || !value.startsWith("/")) {
    return undefined;
  }

  return value;
}

function RegisterPageContent() {
  const searchParams = useSearchParams();
  const returnTo = normalizeRedirect(searchParams.get("returnTo"));

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h2 className="mb-4 text-2xl font-bold">Zarejestruj się</h2>
      <RegisterForm redirectTo={returnTo} />
    </main>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-3xl px-6 py-16">
          <h2 className="mb-4 text-2xl font-bold">Zarejestruj się</h2>
        </main>
      }
    >
      <RegisterPageContent />
    </Suspense>
  );
}
