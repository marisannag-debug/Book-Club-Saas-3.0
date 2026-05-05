import RegisterForm from "../components/auth/RegisterForm";

export default function Page() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h2 className="text-2xl font-bold mb-4">Zarejestruj się</h2>
      <RegisterForm />
    </main>
  );
}
