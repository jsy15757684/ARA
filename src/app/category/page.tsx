'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import ProductCard from '@/components/ui/ProductCard';
import { products, categories, categoryTree, getProductsByCategory } from '@/lib/mock-data';
import Link from 'next/link';

function CategoryContent() {
  const searchParams = useSearchParams();
  const selectedCat = searchParams.get('cat');
  const selectedSub = searchParams.get('sub');
  const searchQuery = searchParams.get('search');

  let displayProducts = products;

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    displayProducts = displayProducts.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.brand.toLowerCase().includes(q) || 
      p.tags.some(t => t.toLowerCase().includes(q))
    );
  } else if (selectedSub) {
    displayProducts = products.filter(p => p.subcategory === selectedSub);
  } else if (selectedCat) {
    displayProducts = getProductsByCategory(selectedCat);
  }

  const currentCategoryTree = categoryTree.find(c => c.name === selectedCat);

  return (
    <div className="fade-in max-w-7xl mx-auto px-4 py-6">
      {/* Category title */}
      <h1 className="text-2xl font-bold text-deep-navy mb-2">
        {searchQuery 
          ? `'${searchQuery}' 검색 결과` 
          : (selectedSub ? `${selectedSub}` : (selectedCat || '전체 상품'))
        }
      </h1>
      <p className="text-base text-warm-gray mb-6">
        {displayProducts.length}개의 상품
      </p>

      {/* Subcategory or Main category tabs */}
      {!searchQuery && (
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        {selectedCat && currentCategoryTree ? (
          <>
            <Link
              href={`/category?cat=${encodeURIComponent(selectedCat)}`}
              className={`shrink-0 px-5 py-2.5 rounded-full text-base font-medium transition-all min-h-0 ${
                !selectedSub
                  ? 'bg-deep-navy text-white'
                  : 'bg-cream text-deep-navy border border-light-beige hover:border-deep-navy'
              }`}
            >
              전체보기
            </Link>
            {currentCategoryTree.subcategories.map(sub => (
              <Link
                key={sub}
                href={`/category?cat=${encodeURIComponent(selectedCat)}&sub=${encodeURIComponent(sub)}`}
                className={`shrink-0 px-5 py-2.5 rounded-full text-base font-medium transition-all min-h-0 ${
                  selectedSub === sub
                    ? 'bg-deep-navy text-white'
                    : 'bg-cream text-deep-navy border border-light-beige hover:border-deep-navy'
                }`}
              >
                {sub}
              </Link>
            ))}
          </>
        ) : (
          <>
            <Link
              href="/category"
              className={`shrink-0 px-5 py-2.5 rounded-full text-base font-medium transition-all min-h-0 ${
                !selectedCat
                  ? 'bg-deep-navy text-white'
                  : 'bg-cream text-deep-navy border border-light-beige hover:border-deep-navy'
              }`}
            >
              전체
            </Link>
            {categories.map(cat => (
              <Link
                key={cat.name}
                href={`/category?cat=${encodeURIComponent(cat.name)}`}
                className={`shrink-0 px-5 py-2.5 rounded-full text-base font-medium transition-all min-h-0 ${
                  selectedCat === cat.name
                    ? 'bg-deep-navy text-white'
                    : 'bg-cream text-deep-navy border border-light-beige hover:border-deep-navy'
                }`}
              >
                {cat.label}
              </Link>
            ))}
          </>
        )}
      </div>
      )}

      {/* Products grid */}
      {displayProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {displayProducts.map((product, i) => (
            <ProductCard key={product.id} product={product} priority={i < 4} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-lg text-warm-gray">검색 조건에 맞는 상품이 없습니다.</p>
        </div>
      )}
    </div>
  );
}

export default function CategoryPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-warm-gray">로딩 중...</p>
      </div>
    }>
      <CategoryContent />
    </Suspense>
  );
}
