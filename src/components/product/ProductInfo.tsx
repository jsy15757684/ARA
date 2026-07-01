'use client';

import { useState } from 'react';
import { Star, Info, Heart, Share2 } from 'lucide-react';
import { Product, formatPrice } from '@/lib/mock-data';

interface ProductInfoProps {
  product: Product;
  selectedOptions: Record<string, string>;
  onOptionChange: (optionName: string, value: string) => void;
}

export default function ProductInfo({
  product,
  selectedOptions,
  onOptionChange,
}: ProductInfoProps) {
  const [isWished, setIsWished] = useState(false);

  const specEntries = Object.entries(product.specs);
  // Show first 3 specs in the quick panel
  const quickSpecs = specEntries.slice(0, 3);

  return (
    <div className="p-5 md:p-8">
      {/* Brand + actions */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium tracking-[0.15em] text-warm-gray">{product.brand}</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsWished(!isWished)}
            className="p-2 rounded-xl hover:bg-cream transition-colors min-h-0"
            aria-label="찜하기"
          >
            <Heart className={`w-6 h-6 ${isWished ? 'fill-accent-red text-accent-red' : 'text-warm-gray'}`} />
          </button>
          <button className="p-2 rounded-xl hover:bg-cream transition-colors min-h-0" aria-label="공유">
            <Share2 className="w-6 h-6 text-warm-gray" />
          </button>
        </div>
      </div>

      {/* Name */}
      <h1 className="text-2xl md:text-3xl font-bold text-deep-navy leading-tight mb-3">
        {product.name}
      </h1>

      {/* Rating */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'fill-soft-gold text-soft-gold' : 'text-light-beige'}`}
            />
          ))}
        </div>
        <span className="text-base font-semibold">{product.rating}</span>
        <span className="text-base text-warm-gray">후기 {product.reviewCount.toLocaleString()}개</span>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-3 mb-6 pb-6 border-b border-light-beige">
        {product.discountRate > 0 && (
          <span className="text-2xl font-bold text-accent-red">{product.discountRate}%</span>
        )}
        <span className="text-2xl md:text-3xl font-bold text-deep-navy">{formatPrice(product.price)}</span>
        {product.originalPrice > product.price && (
          <span className="text-lg line-through text-warm-gray">{formatPrice(product.originalPrice)}</span>
        )}
      </div>

      {/* Quick specs panel */}
      {quickSpecs.length > 0 && (
        <div className={`grid grid-cols-${Math.min(quickSpecs.length, 3)} gap-3 mb-6 p-4 bg-cream rounded-2xl`}>
          {quickSpecs.map(([key, value]) => (
            <div key={key} className="flex flex-col items-center text-center gap-2 py-2">
              <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center shadow-sm">
                <Info className="w-5 h-5 text-soft-gold" />
              </div>
              <div>
                <p className="text-xs text-warm-gray font-medium">{key}</p>
                <p className="text-sm font-semibold text-deep-navy leading-tight">{String(value).split(',')[0]}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Options selection */}
      {product.options.map(option => (
        <div key={option.name} className="mb-5">
          <p className="text-base font-semibold text-deep-navy mb-3">
            {option.name}{' '}
            {selectedOptions[option.name] && (
              <span className="text-warm-gray font-normal">— {selectedOptions[option.name]}</span>
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            {option.values.map(val => (
              <button
                key={val}
                onClick={() => onOptionChange(option.name, val)}
                className={`px-5 py-3 rounded-xl text-base font-medium transition-all min-h-0 ${
                  selectedOptions[option.name] === val
                    ? 'bg-deep-navy text-white'
                    : 'bg-cream text-deep-navy border border-light-beige hover:border-deep-navy'
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Full specs */}
      {specEntries.length > 0 && (
        <div className="pt-6 border-t border-light-beige mb-6">
          <h3 className="text-lg font-bold text-deep-navy mb-3">상품 정보</h3>
          <div className="space-y-2">
            {specEntries.map(([key, value]) => (
              <div key={key} className="flex">
                <span className="w-24 shrink-0 text-sm text-warm-gray font-medium">{key}</span>
                <span className="text-sm text-deep-navy">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      <div className="pt-6 border-t border-light-beige">
        <h3 className="text-lg font-bold text-deep-navy mb-3">상품 설명</h3>
        <p className="text-base text-warm-gray leading-relaxed">{product.description}</p>
      </div>
    </div>
  );
}
