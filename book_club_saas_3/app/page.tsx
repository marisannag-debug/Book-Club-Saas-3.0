import Header from "./components/Header";
import Hero from "./components/Hero";
import FeatureCards from "./components/FeatureCards";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 bg-zinc-50 font-sans">
      <Header />
      <main className="flex-1">
        <Hero />
        <FeatureCards />
      </main>
      <Footer />
    </div>
  );
}
