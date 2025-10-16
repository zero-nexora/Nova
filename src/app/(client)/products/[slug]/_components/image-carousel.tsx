// src/app/products/[slug]/_components/image-carousel.tsx
"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface ImageCarouselProps {
  images?: {
    id: string;
    image_url: string;
    public_id: string;
  }[];
  isLoading?: boolean;
  onSelect?: (index: number) => void;
}

export const ImageCarousel = ({ images, onSelect }: ImageCarouselProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  if (!images || images.length === 0) return null;

  return (
    <div className="relative w-full">
      <div
        className={cn(
          "absolute left-12 top-0 bottom-0 w-12 z-10 bg-gradient-to-r from-white/10 to-transparent pointer-events-none",
          current === 1 && "hidden"
        )}
      />
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          dragFree: true,
        }}
        className="w-full px-12"
      >
        <CarouselContent className="-ml-3">
          {images.map((img, index) => (
            <CarouselItem
              key={img.id}
              className="pl-3 basis-auto cursor-pointer"
              onClick={() => onSelect?.(index)}
              onMouseEnter={() => onSelect?.(index)}
            >
              <div className="relative w-[120px] h-[80px] rounded-lg overflow-hidden border">
                <Image
                  src={img.image_url}
                  alt={img.public_id}
                  fill
                  className="object-cover"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-0 z-20" />
        <CarouselNext className="right-0 z-20" />
      </Carousel>
      <div
        className={cn(
          "absolute right-12 top-0 bottom-0 w-12 z-10 bg-gradient-to-l from-white/10 to-transparent pointer-events-none",
          current === count && "hidden"
        )}
      />
    </div>
  );
};
