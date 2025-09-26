import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const ProductSkeleton: React.FC = () => (
  <Card className="h-full overflow-hidden">
    <CardHeader className="p-0">
      <Skeleton className="w-full h-48 sm:h-56" />
    </CardHeader>
    <CardContent className="p-4 space-y-3">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex gap-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-5 w-20" />
    </CardContent>
    <CardFooter className="p-4 pt-0 space-y-3">
      <div className="w-full space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    </CardFooter>
  </Card>
);
