import { ShoppingCart } from "lucide-react";

interface ProductEmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  isError?: boolean;
}

export const ProductEmptyState = ({
  title,
  description,
  icon,
  isError = false,
}: ProductEmptyStateProps) => (
  <div className="text-center py-12">
    <div className="max-w-md mx-auto">
      <div className="mb-4">
        {icon || (
          <ShoppingCart
            className={`w-16 h-16 mx-auto ${
              isError ? "text-destructive/50" : "text-muted-foreground/50"
            }`}
          />
        )}
      </div>
      <h3
        className={`text-xl font-semibold mb-2 ${
          isError ? "text-destructive" : ""
        }`}
      >
        {title}
      </h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  </div>
);
