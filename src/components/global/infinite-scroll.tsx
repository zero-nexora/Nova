import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { ProductGridSkeleton } from "@/app/(client)/_components/product-grid";

interface InfiniteScrollProps {
  isManual?: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  showSkeleton?: boolean;
  skeletonCount?: number;
}

export const InfiniteScroll = ({
  isManual = false,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  showSkeleton = true,
  skeletonCount = 8,
}: InfiniteScrollProps) => {
  const { targetRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.5,
    rootMargin: "10px",
  });

  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage && !isManual) {
      fetchNextPage();
    }
  }, [
    isIntersecting,
    hasNextPage,
    isFetchingNextPage,
    isManual,
    fetchNextPage,
  ]);

  return (
    <div className="space-y-6">
      {isFetchingNextPage && showSkeleton && (
        <ProductGridSkeleton count={skeletonCount} />
      )}

      <div className="flex flex-col items-center gap-4 p-4">
        {isManual && hasNextPage && (
          <Button
            variant="secondary"
            disabled={isFetchingNextPage}
            onClick={() => fetchNextPage()}
          >
            {isFetchingNextPage ? "Loading..." : "Load more"}
          </Button>
        )}

        {!hasNextPage && (
          <p className="text-xs text-muted-foreground">
            You have reached the end of the list
          </p>
        )}
        <div ref={targetRef} className="h-1" />
      </div>
    </div>
  );
};
