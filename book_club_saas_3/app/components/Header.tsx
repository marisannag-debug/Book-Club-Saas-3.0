export default function Header() {
  return (
    <header className="w-full border-b bg-white">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="/" className="text-xl font-bold">BookClub Pro</a>
        <nav className="flex gap-4">
          <a href="/login" className="text-sm">Log in</a>
          <a href="/register" className="text-sm font-semibold">Sign up</a>
        </nav>
      </div>
    </header>
  );
}
