import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface ErrorDisplayProps {
  errorMessage?: string;
  onRetry?: () => void;
}

export const ErrorDisplay = ({ errorMessage, onRetry }: ErrorDisplayProps) => {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-8 bg-background">
      <Card className="max-w-lg w-full bg-card border-border shadow-xl relative overflow-hidden animate-fade-in">
        {/* Gradient border overlay */}
        <div className="absolute inset-0 border-4 rounded-xl border-border opacity-40" />
        <CardHeader className="flex justify-center">
          <AlertCircle className="w-16 h-16 text-destructive" />
        </CardHeader>
        <CardContent className="text-center">
          <h2 className="text-2xl font-bold text-card-foreground mb-3">
            Something Went Wrong
          </h2>
          <p className="text-lg text-muted-foreground mb-6">
            {errorMessage || "An unexpected error occurred. Please try again."}
          </p>
        </CardContent>
        {onRetry && (
          <CardFooter className="flex justify-center">
            <Button
              onClick={onRetry}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Try Again
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};
