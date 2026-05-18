type ClubLayoutProps = {
  children: React.ReactNode;
};

export default function ClubLayout({ children }: ClubLayoutProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.12),_transparent_30%),linear-gradient(180deg,#f8fafc_0%,#eef4ff_100%)] px-4 py-6 text-slate-900 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-6xl">{children}</div>
    </div>
  );
}