import Hero from "./components/Hero";
import FeatureCards from "./components/FeatureCards";

export default function Home() {
  return (
    <div className="bg-zinc-50 dark:bg-black min-h-screen">
      <Hero />
      <FeatureCards />
    </div>
  );
}
