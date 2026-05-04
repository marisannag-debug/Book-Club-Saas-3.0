export default function Hero() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold">Organizuj swój book club w jednym miejscu</h1>
      <p className="mt-4 text-lg text-zinc-600">Załóż klub, zaproś członków i przeprowadź głosowanie w kilka minut.</p>
      <div className="mt-6 flex gap-4">
        <a href="/register" className="px-4 py-2 bg-blue-600 text-white rounded">Zarejestruj się</a>
        <a href="/login" className="px-4 py-2 border rounded">Masz konto? Zaloguj</a>
      </div>
    </section>
  );
}
