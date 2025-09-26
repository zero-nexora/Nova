interface ProductSectionHeaderProps {
  title?: string;
  description?: string;
}

export const ProductSectionHeader = ({
  title = "Our Products",
  description = "Discover our curated collection of premium products",
}: ProductSectionHeaderProps) => (
  <div className="mb-8">
    <h2 className="text-3xl font-bold mb-2">{title}</h2>
    <p className="text-muted-foreground">{description}</p>
  </div>
);
