export default function Footer() {
  return (
    <footer className="w-full border-t bg-white">
      <div className="max-w-5xl mx-auto px-6 py-6 text-sm text-zinc-600">
        © {new Date().getFullYear()} BookClub Pro — Built with ❤️
      </div>
    </footer>
  );
}
