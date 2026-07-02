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

  const hasMultiple = images.length > 1;

  return (
    <div className="flex flex-col md:flex-row-reverse gap-2 md:gap-3">
      {/* Main Image */}
      <div className="relative w-full aspect-square bg-cream overflow-hidden md:rounded-2xl flex-1">
        {images.map((img, i) => (
          <Image
            key={i}
            src={img}
            alt={`${alt} - ${i + 1}`}
            fill
            className={`object-cover transition-opacity duration-500 ${
              i === current ? 'opacity-100' : 'opacity-0'
            }`}
            priority={i === 0}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ))}

        {/* Navigation arrows */}
        {hasMultiple && (
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

        {/* Mobile dot indicators */}
        {hasMultiple && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 md:hidden">
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
        )}

        {/* Image counter badge */}
        {hasMultiple && (
          <div className="absolute top-4 right-4 bg-black/50 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm">
            {current + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {hasMultiple && (
        <>
          {/* Desktop: Vertical thumbnails on the left */}
          <div className="hidden md:flex flex-col gap-2 w-20 max-h-[500px] overflow-y-auto scrollbar-thin">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                  i === current
                    ? 'border-deep-navy shadow-md ring-1 ring-deep-navy/20'
                    : 'border-transparent opacity-60 hover:opacity-100 hover:border-gray-300'
                }`}
              >
                <Image
                  src={img}
                  alt={`${alt} 썸네일 ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>

          {/* Mobile: Horizontal thumbnails below */}
          <div className="flex md:hidden gap-2 px-4 overflow-x-auto scrollbar-thin pb-1">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                  i === current
                    ? 'border-deep-navy shadow-md'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <Image
                  src={img}
                  alt={`${alt} 썸네일 ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
