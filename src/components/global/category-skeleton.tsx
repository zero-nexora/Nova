"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Filter,
  ArrowUpDown,
  Image as ImageIcon,
  Calendar,
  Hash,
} from "lucide-react";

export const CategorySkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-36" />
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4 py-3 px-4 bg-muted/10 rounded-lg border">
          <div className="flex items-center gap-2 flex-1">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Skeleton className="h-9 max-w-xs flex-1" />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Skeleton className="h-9 w-32" />
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
            <Skeleton className="h-9 w-36" />
            <Skeleton className="h-9 w-16" />
          </div>
        </div>

        {/* Select All Skeleton */}
        <div className="flex items-center justify-between py-4 px-6 bg-muted/20 rounded-lg border">
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-5 w-40" />
          </div>
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      {/* Category Items Skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="border-0 shadow-none"
          >
            <div className="transition-all duration-300 border bg-muted/10 rounded-md">
              <div className="p-3">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-5">
                    {/* Checkbox Skeleton */}
                    <div className="transition-transform">
                      <Skeleton className="h-4 w-4 rounded" />
                    </div>

                    {/* Image Placeholder */}
                    <div className="relative">
                      <div className="w-14 h-14 rounded-xl border-2 border-dashed flex items-center justify-center border-muted-foreground/30">
                        <ImageIcon className="w-6 h-6 text-muted-foreground/60" />
                      </div>
                    </div>

                    {/* Category Info Skeleton */}
                    <div className="flex flex-col items-start space-y-2">
                      <Skeleton className="h-6 w-32" />
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 px-2 py-1 bg-muted/50 rounded-md">
                          <Calendar className="w-3.5 h-3.5" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                        <div className="flex items-center gap-2 px-2 py-1 bg-muted/50 rounded-md">
                          <Hash className="w-3.5 h-3.5" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Status Badge Skeleton */}
                    <Skeleton className="h-6 w-16 rounded-full" />
                    
                    {/* Action Menu Skeleton */}
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                </div>
              </div>

              {/* Expanded Content Skeleton for first item */}
              {index === 0 && (
                <div className="px-6 pb-6">
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-32 mb-4" />
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-4 p-3 bg-muted/20 rounded-lg">
                        <Skeleton className="h-4 w-4 rounded" />
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="flex-1">
                          <Skeleton className="h-5 w-28 mb-2" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                        <Skeleton className="h-6 w-14 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};