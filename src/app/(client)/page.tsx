import { CategorySection } from "./_components/category-section";
import { Header } from "./_components/header";
import { ProductSection } from "./_components/product-section";

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <CategorySection />
      <ProductSection />
    </div>
  );
};

export default Home;
