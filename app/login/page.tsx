import LoginForm from "../components/auth/LoginForm";

export default function Page() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h2 className="text-2xl font-bold mb-4">Zaloguj się</h2>
      <LoginForm />
    </main>
  );
}
