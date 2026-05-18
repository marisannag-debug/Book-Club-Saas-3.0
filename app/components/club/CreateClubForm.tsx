"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClub, validateClubDescription, validateClubName } from "../../../lib/club-create";

const CLUB_NAME_MIN_LENGTH = 3;
const CLUB_NAME_MAX_LENGTH = 60;
const CLUB_DESCRIPTION_MAX_LENGTH = 240;

type FieldErrors = {
  name?: string;
  description?: string;
};

type SubmitStatus =
  | { state: "idle"; message: string }
  | { state: "submitting"; message: string }
  | { state: "success"; message: string; clubId: string }
  | { state: "error"; message: string };

export default function CreateClubForm() {
  const router = useRouter();
  const redirectTimer = useRef<number | null>(null);
  const [formValues, setFormValues] = useState({
    name: "",
    description: "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<SubmitStatus>({ state: "idle", message: "" });

  useEffect(() => {
    return () => {
      if (redirectTimer.current) {
        window.clearTimeout(redirectTimer.current);
      }
    };
  }, []);

  function updateField<K extends keyof typeof formValues>(key: K, value: string) {
    setFormValues((current) => ({
      ...current,
      [key]: value,
    }));

    setFieldErrors((current) => ({
      ...current,
      [key]: undefined,
    }));
  }

  function validateForm() {
    const nextErrors: FieldErrors = {};

    const nameError = validateClubName(formValues.name);
    const descriptionError = validateClubDescription(formValues.description);

    if (nameError) {
      nextErrors.name = nameError;
    }

    if (descriptionError) {
      nextErrors.description = descriptionError;
    }

    setFieldErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateForm()) {
      setStatus({ state: "error", message: "Popraw zaznaczone pola i spróbuj ponownie." });
      return;
    }

    setStatus({ state: "submitting", message: "Tworzymy klub..." });

    const result = await createClub({
      name: formValues.name,
      description: formValues.description,
    });

    if (!result.ok) {
      setStatus({ state: "error", message: result.message });
      return;
    }

    setStatus({
      state: "success",
      message: result.message,
      clubId: result.clubId,
    });

    redirectTimer.current = window.setTimeout(() => {
      router.replace(`/club/${result.clubId}`);
    }, 450);
  }

  const canSubmit =
    !fieldErrors.name &&
    !fieldErrors.description &&
    formValues.name.trim().length >= CLUB_NAME_MIN_LENGTH &&
    formValues.name.trim().length <= CLUB_NAME_MAX_LENGTH &&
    formValues.description.trim().length <= CLUB_DESCRIPTION_MAX_LENGTH &&
    status.state !== "submitting";

  const charactersLeft = CLUB_DESCRIPTION_MAX_LENGTH - formValues.description.length;

  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
      <div className="space-y-2">
        <label htmlFor="club-name" className="text-sm font-semibold text-slate-950">
          Nazwa klubu
        </label>
        <input
          id="club-name"
          name="club-name"
          autoComplete="organization"
          value={formValues.name}
          onChange={(event) => updateField("name", event.target.value)}
          onBlur={() =>
            setFieldErrors((current) => ({
              ...current,
              name: validateClubName(formValues.name),
            }))
          }
          aria-invalid={Boolean(fieldErrors.name)}
          aria-describedby="club-name-help club-name-error"
          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm transition placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          placeholder="Na przykład: Wieczorne czytanie"
        />
        <p id="club-name-help" className="text-xs leading-5 text-slate-500">
          Wystarczy krótka, jasna nazwa. Maksymalnie 60 znaków.
        </p>
        <p id="club-name-error" aria-live="polite" className="min-h-5 text-sm text-red-600">
          {fieldErrors.name || "\u00A0"}
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <label htmlFor="club-description" className="text-sm font-semibold text-slate-950">
            Opis klubu
          </label>
          <span className="text-xs font-medium text-slate-500">{charactersLeft} znaków pozostało</span>
        </div>
        <textarea
          id="club-description"
          name="club-description"
          value={formValues.description}
          onChange={(event) => updateField("description", event.target.value)}
          onBlur={() =>
            setFieldErrors((current) => ({
              ...current,
              description: validateClubDescription(formValues.description),
            }))
          }
          aria-invalid={Boolean(fieldErrors.description)}
          aria-describedby="club-description-help club-description-error"
          className="min-h-32 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm transition placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          placeholder="Opcjonalnie: kilka słów o klimacie klubu, liczbie spotkań albo tematyce czytania"
        />
        <p id="club-description-help" className="text-xs leading-5 text-slate-500">
          Opcjonalny opis pomaga od razu rozpoznać klub na dashboardzie. Maksymalnie 240 znaków.
        </p>
        <p id="club-description-error" aria-live="polite" className="min-h-5 text-sm text-red-600">
          {fieldErrors.description || "\u00A0"}
        </p>
      </div>

      <div aria-live="polite" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
        {status.state === "idle" && "Po utworzeniu klubu od razu trafisz do jego panelu."}
        {status.state === "submitting" && "Tworzymy klub..."}
        {status.state === "success" && status.message}
        {status.state === "error" && status.message}
      </div>

      {status.state === "success" ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm leading-6 text-emerald-900">
          <p className="font-semibold">Klub gotowy</p>
          <p className="mt-1">Twój klub został przygotowany. Za chwilę przeniesiemy Cię do panelu klubu.</p>
          <Link
            href={`/club/${status.clubId}`}
            className="mt-3 inline-flex items-center justify-center rounded-full bg-emerald-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-950/20"
          >
            Otwórz klub teraz
          </Link>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950/20"
        >
          {status.state === "submitting" ? "Tworzymy klub..." : "Utwórz klub"}
        </button>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-950/20"
        >
          Anuluj
        </Link>
      </div>
    </form>
  );
}

export { validateClubDescription, validateClubName };