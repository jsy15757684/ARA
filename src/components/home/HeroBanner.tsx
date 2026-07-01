'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

const slides = [
  {
    id: 1,
    image: '/images/hero_general.png',
    subtitle: '2026 SUMMER SALE',
    title: '여름맞이\n특별 할인전',
    description: '패션부터 가전까지 최대 40% OFF',
    cta: '지금 보기',
    href: '/category?cat=패션의류',
  },
  {
    id: 2,
    image: '/images/hero_general.png',
    subtitle: 'NEW ARRIVALS',
    title: '이번 주\n신상품 모음',
    description: '엄선된 프리미엄 신상품을 만나보세요',
    cta: '신상품 보기',
    href: '/category?cat=뷰티·향수',
  },
  {
    id: 3,
    image: '/images/hero_general.png',
    subtitle: 'GIFT SPECIAL',
    title: '감사의 마음을\n선물로 전하세요',
    description: '받는 분이 만족하는 선물 베스트',
    cta: '선물 추천',
    href: '/category?cat=식품·건강',
  },
];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[current];

  return (
    <section className="relative w-full overflow-hidden bg-deep-navy">
      {/* Image */}
      <div className="relative h-[65vh] md:h-[70vh] max-h-[700px]">
        <Image
          src={slide.image}
          alt={slide.title}
          fill
          className="object-cover object-center transition-opacity duration-700"
          priority
          sizes="100vw"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-deep-navy/80 via-deep-navy/30 to-transparent" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 max-w-7xl mx-auto">
          <p className="text-soft-gold text-sm md:text-base font-semibold tracking-[0.2em] mb-3">
            {slide.subtitle}
          </p>
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight whitespace-pre-line mb-4">
            {slide.title}
          </h1>
          <p className="text-white/80 text-lg md:text-xl mb-6">{slide.description}</p>
          <Link
            href={slide.href}
            className="inline-flex items-center gap-2 bg-soft-gold text-white font-semibold
                       py-4 px-8 rounded-xl text-lg hover:bg-soft-gold/90 transition-all
                       active:scale-[0.98]"
          >
            {slide.cta}
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-6 right-6 md:right-12 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all min-h-0 min-w-0 ${
                i === current ? 'bg-soft-gold w-8' : 'bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`슬라이드 ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
