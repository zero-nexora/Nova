import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface NotFoundProps {
  message?: string;
  onGoBack?: () => void;
}

export const NotFoundDisplay = ({ message, onGoBack }: NotFoundProps) => {
  const router = useRouter();

  const handleGoBack = onGoBack || (() => router.push("/"));

  return (
    <div className="flex items-center justify-center min-h-[400px] p-8 bg-background">
      <Card className="max-w-lg w-full bg-card border-border shadow-xl relative overflow-hidden animate-fade-in">
        {/* Gradient border overlay */}
        <div className="absolute inset-0 border-4 rounded-xl border-border opacity-40" />
        <CardHeader className="flex justify-center">
          <AlertCircle className="w-16 h-16 text-muted-foreground" />
        </CardHeader>
        <CardContent className="text-center">
          <h2 className="text-2xl font-bold text-card-foreground mb-3">
            Page Not Found
          </h2>
          <p className="text-lg text-muted-foreground mb-6">
            {message || "The page you are looking for does not exist."}
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            onClick={handleGoBack}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Go Back Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
