'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageSliderProps {
  images: string[];
  alt: string;
}

export default function ImageSlider({ images, alt }: ImageSliderProps) {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent(i => (i - 1 + images.length) % images.length);
  const next = () => setCurrent(i => (i + 1) % images.length);

  return (
    <div className="relative w-full aspect-square bg-cream overflow-hidden">
      <Image
        src={images[current]}
        alt={`${alt} - ${current + 1}`}
        fill
        className="object-cover transition-opacity duration-300"
        priority
        sizes="(max-width: 768px) 100vw, 50vw"
      />

      {/* Navigation arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-surface/80 backdrop-blur-sm
                       rounded-full flex items-center justify-center shadow-md hover:bg-surface transition-all"
            aria-label="이전 이미지"
          >
            <ChevronLeft className="w-5 h-5 text-deep-navy" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-surface/80 backdrop-blur-sm
                       rounded-full flex items-center justify-center shadow-md hover:bg-surface transition-all"
            aria-label="다음 이미지"
          >
            <ChevronRight className="w-5 h-5 text-deep-navy" />
          </button>
        </>
      )}

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all min-h-0 min-w-0 ${
              i === current ? 'bg-deep-navy w-6' : 'bg-deep-navy/30'
            }`}
            aria-label={`이미지 ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
