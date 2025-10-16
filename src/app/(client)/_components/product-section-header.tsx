interface ProductSectionHeaderProps {
  title?: string;
  description?: string;
}

export const ProductSectionHeader = ({
  title = "Our Products",
  description = "Discover our curated collection of premium products",
}: ProductSectionHeaderProps) => (
  <div className="mb-6">
    <h1 className="text-3xl font-bold mb-2">{title}</h1>
    <p className="text-muted-foreground">{description}</p>
  </div>
);
