"use client";

import { RefObject, useEffect, useRef, useState } from "react";

export const useInfiniteScrollTrigger = (
  loadMore: () => void,
  hasNextPage?: boolean,
  isFetchingNextPage?: boolean
) => {
  const loadMoreRef = useRef<any>(null);
  const isIntersecting = useIntersection(loadMoreRef, {
    rootMargin: "10px",
  });

  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage) {
      loadMore();
    }
  }, [isIntersecting, hasNextPage, isFetchingNextPage, loadMore]);

  return loadMoreRef;
};

export const useIntersection = (
  ref: RefObject<Element>,
  options?: IntersectionObserverInit
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(element);

    return () => observer.disconnect();
  }, [ref, options]);

  return isIntersecting;
};
