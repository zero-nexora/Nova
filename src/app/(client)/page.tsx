import { CategorySection } from "./_components/category-section";
import { Header } from "./_components/header";

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <CategorySection />
      <main className="flex-1 bg-gradient-to-b from-background to-muted/20">
      </main>
    </div>
  );
};

export default Home;
