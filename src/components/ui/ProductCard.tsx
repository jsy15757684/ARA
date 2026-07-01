import Link from 'next/link';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { Product, formatPrice } from '@/lib/mock-data';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const tagStyle = (tag: string) => {
    switch (tag) {
      case 'MD추천': return 'bg-soft-gold text-white';
      case '신상품': return 'bg-emerald-500 text-white';
      case '인기': return 'bg-deep-navy text-white';
      case '할인': return 'bg-accent-red text-white';
      case '베스트': return 'bg-amber-500 text-white';
      case '선물추천': return 'bg-pink-500 text-white';
      case '건강추천': return 'bg-green-600 text-white';
      default: return 'bg-warm-gray text-white';
    }
  };

  return (
    <Link href={`/product/${product.id}`} className="card group block min-h-0 min-w-0">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-cream">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          priority={priority}
        />
        {/* Tags */}
        {product.tags.length > 0 && (
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {product.tags.slice(0, 2).map(tag => (
              <span
                key={tag}
                className={`text-xs font-bold px-2 py-1 rounded-md ${tagStyle(tag)}`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        {/* Discount badge */}
        {product.discountRate > 0 && (
          <span className="absolute top-3 right-3 discount-badge">
            {product.discountRate}%
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-warm-gray font-medium tracking-wider mb-1">{product.brand}</p>
        <h3 className="text-base font-semibold text-deep-navy leading-snug mb-2 line-clamp-2">
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex flex-col gap-0.5 mb-2">
          {product.originalPrice > product.price && (
            <span className="text-xs text-warm-gray font-medium line-through decoration-warm-gray/50">
              {formatPrice(product.originalPrice)}
            </span>
          )}
          <div className="flex items-baseline gap-1.5">
            {product.discountRate > 0 && (
              <span className="text-sm font-bold text-accent-red">{product.discountRate}%</span>
            )}
            <span className="text-lg font-bold text-deep-navy tracking-tight">{formatPrice(product.price)}</span>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 fill-soft-gold text-soft-gold" />
          <span className="text-sm font-medium text-deep-navy">{product.rating}</span>
          <span className="text-sm text-warm-gray">({product.reviewCount.toLocaleString()})</span>
        </div>
      </div>
    </Link>
  );
}
