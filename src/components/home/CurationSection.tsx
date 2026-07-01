import { ChevronRight } from 'lucide-react';
import ProductCard from '@/components/ui/ProductCard';
import { Product } from '@/lib/mock-data';

interface CurationSectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
}

export default function CurationSection({ title, subtitle, products }: CurationSectionProps) {
  return (
    <section className="py-8 px-4 max-w-7xl mx-auto">
      {/* Section header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="section-title">{title}</h2>
          {subtitle && (
            <p className="text-base text-warm-gray mt-1">{subtitle}</p>
          )}
        </div>
        <button className="flex items-center gap-0.5 text-sm font-medium text-warm-gray hover:text-deep-navy transition-colors min-h-0">
          더보기
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((product, i) => (
          <ProductCard key={product.id} product={product} priority={i < 4} />
        ))}
      </div>
    </section>
  );
}
